import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

type Props = {
  value: string;
  onChange: (content: string) => void;
};

const RichTextEditor = ({ value, onChange }: Props) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  return (
    <>
      <style>
        {`
        /* Wrapper */
        .rich-editor-wrapper {
          width: 100%;
          margin: 12px 0;
        }

        /* Toolbar */
        .rich-editor-wrapper .ql-toolbar {
          background: #1e1e1e !important;
          border: 1px solid #333 !important;
          border-radius: 10px 10px 0 0 !important;
        }

        /* Toolbar icons → WHITE */
        .ql-toolbar .ql-stroke {
          stroke: #ffffff !important;
        }

        .ql-toolbar .ql-fill {
          fill: #ffffff !important;
        }

        .ql-picker-label {
          color: #ffffff !important;
        }

        .ql-picker-options {
          background: #2b2b2b !important;
          border: 1px solid #444 !important;
        }

        .ql-picker-item {
          color: white !important;
        }

        /* Hover color for toolbar buttons */
        .ql-toolbar button:hover .ql-stroke {
          stroke: #e5e5e5 !important;
        }

        .ql-toolbar button:hover .ql-fill {
          fill: #e5e5e5 !important;
        }

        /* Editor container */
        .rich-editor-wrapper .ql-container {
          background: #121212 !important;
          border: 1px solid #333 !important;
          border-radius: 0 0 10px 10px !important;
          min-height: 260px;
          color: #ffffff !important;
          font-size: 16px;
        }

        /* Editor text */
        .rich-editor-wrapper .ql-editor {
          min-height: 220px;
          padding: 20px;
          color: #ffffff !important;
          line-height: 1.6;
        }

        /* Placeholder → light gray */
        .ql-editor.ql-blank::before {
          color: #aaaaaa !important;
          opacity: 0.7 !important;
        }

        /* Focus ring */
        .rich-editor-wrapper .ql-container:focus-within,
        .rich-editor-wrapper .ql-toolbar:focus-within {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 6px rgba(59, 130, 246, 0.6);
        }
      `}
      </style>

      <div className="rich-editor-wrapper">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          placeholder="Write something..."
        />
      </div>
    </>
  );
};

export default RichTextEditor;
