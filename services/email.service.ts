import axios from "axios";
import toast from "react-hot-toast";
import * as postmark from "postmark";

export async function sendEmail(emailMessage: Partial<postmark.Message>) {
  try {
    const { data, status } = await axios.post("/api/sendemail", emailMessage, {
      headers: {
        "Content-Type": "application/json",
      },
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

export async function sendServerEmail(emailMessage: Partial<postmark.Message>) {
  try {
    const { data, status } = await axios.post("/api/sendemail", emailMessage, {
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("error server message : ", error.message);
      return error.message;
    } else {
      console.log("unexpected error: ", error);
      return "An unexpected error occurred";
    }
  }
}

export async function callNestSendEmail(emailMessage) {
  try {
    const { data, status } = await axios.post(
      "https://api.swapnilsrivastava.eu/sendemail",
      emailMessage,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
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
