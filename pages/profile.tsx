import { Fragment, useState, useMemo } from "react";
import { JsonForms } from "@jsonforms/react";

import Button from "@mui/material/Button";

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
  const stringifiedData = useMemo(() => JSON.stringify(data, null, 2), [data]);

  const clearData = () => {
    setData({});
  };

  return (
    <Fragment>
      <div>
        <pre id="boundData">{stringifiedData}</pre>
      </div>
      <Button onClick={clearData} color="primary" variant="contained">
        Clear data
      </Button>

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
    </Fragment>
  );
};

export default Profile;
