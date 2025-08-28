import React, { useRef, useMemo } from "react";
import JoditEditor from "jodit-react";

const Editor = ({ value, onChange, placeholder = "Start typing..." }) => {
  const editorRef = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder,
      toolbarButtonSize: "small",
      uploader: {
        insertImageAsBase64URI: true,
      },
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
      className="h-20"
    />
  );
};

export default Editor;
