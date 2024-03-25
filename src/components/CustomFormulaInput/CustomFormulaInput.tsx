import { useEffect, useState } from "react";
import { useSuggestionStore } from "../../store/useSuggestion";
import { TTag, useTagStore } from "../../store/useTag";
import { Suggestion } from "../../types/suggestion";

export const CustomFormulaInput = () => {
  const { suggestion } = useSuggestionStore();
  const { tags, addTag, updateTag, removeTag } = useTagStore();
  const [filteredSuggestions, setFilteredSuggestion] = useState<Suggestion[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [operators, setOperators] = useState<string[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (suggestion) {
      setFilteredSuggestion(
        suggestion.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleAddTag = (itemTitle: TTag) => {
    addTag(itemTitle);
    setSearchQuery("");
    setErrorMessage(null);
  };

  const handleMainInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchQuery(text);
    setErrorMessage(null);
    if (tags.length > operators.length && text.length === 0) {
      setOperators((prev) => prev.slice(0, prev.length - 1));
    }
  };

  const handleBackspace = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (searchQuery.length > 0) {
        return;
      } else {
        if (tags.length) {
          if (tags.length === operators.length) {
            setOperators((prev) => prev.slice(0, prev.length - 1));
          } else {
            removeTag(tags.length - 1);
          }
        }
      }
    }
    if (e.key === "Enter" && tags.length > operators.length) {
      if (/^[+\-*/^()]*$/.test(searchQuery)) {
        setOperators((prev) => [...prev, searchQuery]);
        setSearchQuery("");
        setErrorMessage(null);
      }
    }
  };

  const handleResult = () => {
    setErrorMessage(null);
    let result = "";
    for (let i = 0; i < tags.length; i++) {
      result += tags[i].value;
      if (operators[i]) {
        result += operators[i] === "^" ? "**" : operators[i];
      }
    }

    if (/[(+\-*^/]$/.test(result)) {
      result = result.slice(0, -1);
    }

    try {
      setResult(eval(result));
    } catch (error) {
      console.log(error);
      setErrorMessage("Error, check your expression!");
    }
  };

  return (
    <>
      <div className="w-full flex">
        <div className="grow flex flex-wrap items-center bg-zinc-100 border p-2 relative">
          {tags?.length > 0 &&
            tags.map((item: TTag, index: number) => (
              <>
                <div
                  key={item.title + index}
                  className="flex items-center p-2 bg-zinc-300 rounded-lg h-full gap-1"
                >
                  <button
                    onClick={() => removeTag(index)}
                    className="p-1 px-2 leading-[1rem] bg-zinc-700 text-white rounded-full flex items-center justify-center"
                  >
                    x
                  </button>
                  <div>{item.title}</div>
                  <div className="w-[1px] bg-zinc-700 h-6 flex" />
                  <input
                    autoFocus
                    placeholder="Value"
                    className="bg-zinc-200 rounded-sm w-16 outline-none"
                    value={item.value}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (/^\d*\.?\d*$/.test(newValue)) {
                        updateTag(index, { ...item, value: +newValue });
                      }
                    }}
                  />
                </div>
                {operators[index] && (
                  <div className="mx-2 text-2xl font-bold">
                    {operators[index]}
                  </div>
                )}
              </>
            ))}

          <input
            autoFocus
            placeholder={
              tags.length === operators.length
                ? "Enter Tag"
                : "Enter Math Operator"
            }
            className="grow bg-transparent rounded-lg py-2 px-4 outline-none"
            value={searchQuery}
            onChange={handleMainInput}
            onKeyDown={handleBackspace}
          />
          {searchQuery.length > 0 &&
            filteredSuggestions.length > 0 &&
            tags.length === operators.length && (
              <div className="absolute top-full left-0 right-0 border-t flex flex-col">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.name + `${index}`}
                    className="bg-gray-100 py-1 px-4 cursor-pointer hover:bg-gray-200"
                    onClick={() =>
                      handleAddTag({ title: suggestion.name, value: 0 })
                    }
                  >
                    {suggestion.name}
                  </button>
                ))}
              </div>
            )}
        </div>

        <button
          className="p-2 px-5 font-bold  bg-blue-500 text-white"
          onClick={handleResult}
        >
          =
        </button>
      </div>
      <div className="text-right w-full">{result}</div>
      <div className="text-right w-full text-red-500 font-bold text-xl">
        {errorMessage}
      </div>
    </>
  );
};
