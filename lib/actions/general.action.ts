import { db } from "@/firebase/admin";

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null> {
  try {
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