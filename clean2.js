import fs from 'fs';

let content = fs.readFileSync('src/components/GameScreen.tsx', 'utf8');

content = content.replace(/\r\n/g, '\n');

const first = content.indexOf('renderTacticalAbilitiesDeck');
if (first !== -1) {
  const second = content.indexOf('renderTacticalAbilitiesDeck', first + 50);
  if (second !== -1) {
    const startOfSegment = second - 30;
    const endOfSegment = second + 180;
    const segment = content.slice(startOfSegment, endOfSegment);
    console.log("ACTUAL SECOND CONTEXT SEGMENT IN FILE:\n", JSON.stringify(segment));
    
    // We want to replace this segment in the file with standard clean values
    // Looking at the console outputs, we can write a clean replace
    const cleanSegment = "              {renderTacticalAbilitiesDeck()}\n            </div>\n          )}\n\n          {";
    
    content = content.slice(0, startOfSegment) + cleanSegment + content.slice(endOfSegment);
    fs.writeFileSync('src/components/GameScreen.tsx', content, 'utf8');
    console.log("Cleaned successfully with index slices!");
  }
}
