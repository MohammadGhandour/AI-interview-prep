"use server";

import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
  try {
    if (!userId) return [];
    const interviews = await db.collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return interviews.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Interview[];
  } catch (error) {
    console.error("Error fetching interviews", error);
    return [];
  }
};

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
  try {
    const { userId, limit = 20 } = params;
    if (!userId) return [];
    const interviews = await db.collection("interviews")
      .orderBy("createdAt", "desc")
      .where("finalized", "==", true)
      .where("userId", "!=", userId)
      .limit(limit)
      .get();

    return interviews.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Interview[];
  } catch (error) {
    console.error("Error fetching interviews", error);
    return [];
  }
};

export async function getInterviewById(id: string): Promise<Interview | null> {
  try {
    const interview = await db.collection("interviews").doc(id).get();
    return interview.exists ? { ...interview.data(), id: interview.id } as Interview : null;
  } catch (error) {
    console.error("Error fetching interview by ID", error);
    return null;
  }
};

export async function createFeedback(params: CreateFeedbackParams) {
  try {
    const { interviewId, userId, transcript, feedbackId } = params;
    const formattedTranscript = transcript.map((sentence: { role: string; content: string; }) => (
      `- ${sentence.role}: ${sentence.content}\n`
    )).join("");

    const { object: { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system: "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories"
    });

    const feedback = await db.collection("feedback").add({
      interviewId,
      userId,
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
      createdAt: new Date().toISOString()
    });

    return { success: true, feedbackId: feedback.id };
  } catch (error) {
    console.error("Error creating feedback", error);
    return { success: false, feedbackId: null };
  }
};

export async function getFeedbackByInterviewId(params: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
  try {
    const { userId, interviewId } = params;
    const feedback = await db.collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (feedback.empty) return null;
    const feedbackDoc = feedback.docs[0];
    return {
      id: feedbackDoc.id,
      ...feedbackDoc.data()
    } as Feedback
  } catch (error) {
    console.error("Error fetching interviews", error);
    return null;
  }
};

export async function deleteFeedback(params: DeleteFeedbackParams) {
  try {
    const { feedbackId, userId } = params;
    const feedback = await db.collection("feedback").doc(feedbackId).get();
    if (!feedback.exists) return { success: false, message: "Feedback not found." };
    if (feedback.data()?.userId !== userId) return { success: false, message: "Unauthorized." };
    await db.collection("feedback").doc(feedbackId).delete();

    return { success: true, message: "Feedback deleted successfully." };
  } catch (error) {
    console.error("Error deleting feedback", error);
    return { success: false, message: "Failed to delete feedback." };
  }
};
