import React from 'react';
import { 
  ThemeProvider,
  Subject,
  Paragraph 
} from "./Context";


// import {
//   ThemeProviderNow,
//   Subject,
//   Paragraph 
// } from "./ThemeContext";

const Page = () => (
  <div>
    <Subject>这是标题</Subject>
    <Paragraph>
      这是正文
    </Paragraph>
  </div>
);

const Theme = <ThemeProvider value={{mainColor: 'green', textColor: 'red'}} >
  <Page />
</ThemeProvider>;

export default Theme;


