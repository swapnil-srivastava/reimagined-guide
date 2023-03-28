import { useState, useMemo } from "react";
import { JsonForms } from "@jsonforms/react";

import schema from "../lib/schema.json";
import uischema from "../lib/uischema.json";

import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";

const initialData = {
  name: "Send email to Adrian",
  description: "Confirm if you have passed the subject\nHereby ...",
  done: true,
  recurrence: "Daily",
};

const Profile = () => {
  const [data, setData] = useState<any>(initialData);

  const clearData = () => {
    setData({});
  };

  return (
    <>
      <div>
        <JsonForms
          schema={schema}
          uischema={uischema}
          data={data}
          renderers={materialRenderers}
          cells={materialCells}
          onChange={({ errors, data }) => setData(data)}
        />
      </div>
    </>
  );
};

export default Profile;
