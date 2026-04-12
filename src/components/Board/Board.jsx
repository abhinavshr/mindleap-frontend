import Tile from "./Tile";

export default function Board({ guesses = [], currentGuess = "", maxGuesses = 6, wordLength = 5 }) {
  const rows = Array.from({ length: maxGuesses }, (_, rowIndex) => {
    const submittedGuess = guesses[rowIndex];
    const isCurrentRow = rowIndex === guesses.length;

    return Array.from({ length: wordLength }, (_, colIndex) => {
      if (submittedGuess) {
        return {
          letter: submittedGuess.word[colIndex] || "",
          status: submittedGuess.result[colIndex] || "absent",
        };
      }
      if (isCurrentRow) {
        return {
          letter: currentGuess[colIndex] || "",
          status: currentGuess[colIndex] ? "active" : "empty",
        };
      }
      return { letter: "", status: "empty" };
    });
  });

  return (
    <div className="flex flex-col items-center gap-1.25">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.25">
          {row.map((tile, colIndex) => (
            <Tile key={colIndex} letter={tile.letter} status={tile.status} />
          ))}
        </div>
      ))}
    </div>
  );
}