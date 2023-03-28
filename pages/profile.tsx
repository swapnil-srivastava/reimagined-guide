import { Fragment, useState, useMemo } from "react";
import { JsonForms } from "@jsonforms/react";

import Grid from "@mui/material/Grid";
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

const renderers = [...materialRenderers];

const Profile = () => {
  const [data, setData] = useState<any>(initialData);
  const stringifiedData = useMemo(() => JSON.stringify(data, null, 2), [data]);

  const clearData = () => {
    setData({});
  };

  return (
    <Fragment>
      <Grid container justifyContent={"center"} spacing={1}>
        <Grid item sm={6}>
          <div>
            <pre id="boundData">{stringifiedData}</pre>
          </div>
          <Button onClick={clearData} color="primary" variant="contained">
            Clear data
          </Button>
        </Grid>
        <Grid item sm={6}>
          <div>
            <JsonForms
              schema={schema}
              uischema={uischema}
              data={data}
              renderers={renderers}
              cells={materialCells}
              onChange={({ errors, data }) => setData(data)}
            />
          </div>
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default Profile;
