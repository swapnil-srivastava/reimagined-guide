import axios from "axios";
import toast from "react-hot-toast";

export async function callNest() {
  try {
    const { data, status } = await axios.get(
      "https://api.swapnilsrivastava.eu/helloworld",
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    toast.success(`Called Nest JS Hello World ${data}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("error message: ", error.message);
      toast.error("Axios Nest JS Hello World GET");
      return error.message;
    } else {
      console.log("unexpected error: ", error);
      toast.error("Error Nest JS");
      return "An unexpected error occurred";
    }
  }
}
