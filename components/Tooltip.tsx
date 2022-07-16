import Tooltip from '@mui/material/Tooltip';

export function BasicTooltip(props) {
  return (
    <Tooltip {...props}>
      {props.children}
    </Tooltip>
  );
}

export default BasicTooltip;