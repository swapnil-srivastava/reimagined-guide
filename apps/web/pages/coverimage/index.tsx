import React from "react";
import Image from "next/legacy/image";
import { useThemeSettings } from "../../lib/use-theme-settings";
import mountains from "../../public/mountains.jpg";
import { Button } from "@mui/material";
import { callNest } from "../../services/helloWorld.service";
import { callNestSendEmail } from "../../services/email.service";
import * as postmark from "postmark";

function Pics() {
  const { mode } = useThemeSettings();
  const emailMessage = {
    to: "contact@swapnilsrivastava.eu",
    subject: "nest email",
    htmlBody: `<strong>Hello</strong> Swapnil Srivastava, nest email check`,
  };

  return (
    <div className="min-h-screen theme-blue-light dark:theme-blue-dark" style={{ backgroundColor: mode === 'dark' ? 'var(--fun-blue-500)' : 'var(--bg-primary)', color: 'var(--text-primary)'}}>
      <Image
        alt="Mountains"
        src={mountains}
        placeholder="blur"
        quality={100}
        sizes="100vw"
        style={{
          objectFit: "cover",
        }}
      />
      <div className="p-4">
        <Button className="bg-white card--white" onClick={() => callNest()}>call nest</Button>
        <Button className="ml-2 bg-white card--white" onClick={() => callNestSendEmail(emailMessage)}>Call send email from nest</Button>
      </div>
    </div>
  );
}

export default Pics;
