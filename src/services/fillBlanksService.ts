
export const generateFillInBlanks = (text: string): string => {
  const words = text.split(' ');
  
  if (words.length <= 2) {
    return words.slice(0, -1).join(' ') + ' _____';
  }
  
  const blankCount = Math.max(1, Math.floor(words.length * 0.25));
  const wordIndices = Array.from({length: words.length}, (_, i) => i);
  const blankIndices = [];
  
  for (let i = 0; i < blankCount; i++) {
    const randomIndex = Math.floor(Math.random() * wordIndices.length);
    const selectedIndex = wordIndices[randomIndex];
    
    if (blankIndices.includes(selectedIndex - 1) || 
        blankIndices.includes(selectedIndex + 1) || 
        words[selectedIndex].length <= 2) {
      i--;
    } else {
      blankIndices.push(selectedIndex);
      wordIndices.splice(randomIndex, 1);
    }
  }
  
  return words
    .map((word, index) => blankIndices.includes(index) ? '_____' : word)
    .join(' ');
};
