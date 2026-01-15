"use client";

import React from "react";
import { JsonForms } from "@jsonforms/react";
import { materialCells, materialRenderers } from "@jsonforms/material-renderers";

interface Props {
  schema: any;
  uischema: any;
  data: any;
  onChange: (e: any) => void;
}

export default function JsonFormsClient({ schema, uischema, data, onChange }: Props) {
  return (
    <JsonForms
      schema={schema}
      uischema={uischema}
      data={data}
      renderers={materialRenderers}
      cells={materialCells}
      onChange={onChange}
    />
  );
}
