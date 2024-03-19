import { createTheme } from '@mui/material/styles';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: '#eb7878',
    },
    secondary: {
      main: '#d0efb5',
    },
  },
});

export default theme;