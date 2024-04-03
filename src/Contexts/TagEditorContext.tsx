import React, { createContext, useReducer } from "react";

type TagEditorState = {
  currentTags: string[];
};

type TagEditorAction =
  | { type: "SET_TAGS"; payload: string[] }
  | { type: "ADD_TAGS"; payload: string }
  | { type: "REMOVE_TAGS"; payload: string };

const TagEditorContext = createContext<{
  state: TagEditorState;
  dispatch: React.Dispatch<TagEditorAction>;
}>({
  state: { currentTags: [] },
  dispatch: () => undefined,
});

const currentTagsReducer = (
  state: TagEditorState,
  action: TagEditorAction
): TagEditorState => {
  switch (action.type) {
    case "SET_TAGS":
      return { ...state, currentTags: action.payload };
    case "ADD_TAGS":
      return { ...state, currentTags: [...state.currentTags, action.payload] };
    case "REMOVE_TAGS":
      return {
        ...state,
        currentTags: [],
      };
    default:
      return state;
  }
};

const TagEditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(currentTagsReducer, { currentTags: [] });

  return (
    <TagEditorContext.Provider value={{ state, dispatch }}>
      {children}
    </TagEditorContext.Provider>
  );
};

export { TagEditorContext, TagEditorProvider };
