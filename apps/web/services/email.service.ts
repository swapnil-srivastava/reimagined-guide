import axios from "axios";
import toast from "react-hot-toast";
import * as postmark from "postmark";
import { supaClient } from "../supa-client";

async function authHeaders() {
  const {
    data: { session },
  } = await supaClient.auth.getSession();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token ?? ""}`,
  };
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { error?: string })?.error ?? fallback;
  }
  return fallback;
}

/** Emails the admin that a Web Ready draft is waiting for approval. */
export async function submitPostForApproval(
  postId: string
): Promise<{ emailSent: boolean }> {
  try {
    const { data } = await axios.post(
      "/api/posts/submit",
      { postId },
      { headers: await authHeaders() }
    );
    return data;
  } catch (error) {
    throw new Error(apiErrorMessage(error, "Could not submit the post."));
  }
}

export type PostReviewAction = "approve" | "request_changes" | "unpublish";

/** Approves, sends back or unpublishes a post. Permissions are checked server side. */
export async function reviewPost(
  postId: string,
  action: PostReviewAction,
  note?: string
): Promise<{ ok: boolean; emailSent: boolean }> {
  try {
    const { data } = await axios.post(
      "/api/posts/review",
      { postId, action, note },
      { headers: await authHeaders() }
    );
    return data;
  } catch (error) {
    throw new Error(apiErrorMessage(error, "Could not update the post."));
  }
}

export async function sendEmail(emailMessage: Partial<postmark.Message>) {
  try {
    const { data, status } = await axios.post("/api/sendemail", emailMessage, {
      headers: await authHeaders(),
    });

    toast.success(`Email sent`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("error message: ", error.message);
      toast.error("Axios Error Email");
      return error.message;
    } else {
      console.log("unexpected error: ", error);
      toast.error("Error Email");
      return "An unexpected error occurred";
    }
  }
}

export async function callNestSendEmail(emailMessage) {
  try {
    const { data, status } = await axios.post(
      "https://api.swapnilsrivastava.eu/helloworld/sendnestemail",
      emailMessage,
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://swapnilsrivastava.eu"
        },
        withCredentials: true,
      },
      
    );

    toast.success(`Called Nest JS sendemail ${data}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("error message: ", error.message);
      toast.error("Axios Nest JS SendEmail POST");
      return error.message;
    } else {
      console.log("unexpected error: ", error);
      toast.error("Error Nest JS");
      return "An unexpected error occurred";
    }
  }
}
