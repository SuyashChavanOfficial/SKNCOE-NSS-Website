import React, { useRef, useMemo } from "react";
import JoditEditor from "jodit-react";

const Editor = ({ value, onChange, placeholder = "Start typing..." }) => {
  const editorRef = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder,
      toolbarButtonSize: "medium",
      height: "auto",
      minHeight: "400px",
      buttons: [
        "bold",
        "italic",
        "underline",
        "|",
        "link",
        "unlink",
        "|",
        "ul",
        "ol",
        "|",
        "source",
      ],
    }),
    [placeholder]
  );

  return (
    <JoditEditor
      ref={editorRef}
      value={value}
      config={config}
      tabIndex={1}
      onBlur={(newContent) => onChange(newContent)}
      onChange={() => {}}
    />
  );
};

export default Editor;
