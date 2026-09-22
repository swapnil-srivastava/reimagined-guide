import React from 'react';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

const BasicTooltip: React.FC<TooltipProps> = (props) => {
  return (
    <Tooltip {...props}>
      {props.children}
    </Tooltip>
  );
};

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
        <Tooltip {...props} classes={{ popper: className }} />
      ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
          backgroundColor: 'var(--color-primary)',
          color: 'var(--bg-primary)',
          boxShadow: theme.shadows[1],
          fontSize: 14,
        },
      }));

export default BasicTooltip;
export { LightTooltip };