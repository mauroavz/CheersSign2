import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { blueCheers, cleanBorder } from "./utils/colors";

export default function Drop({ onLoaded }) {
  const styles = {
    container: {
      textAlign: "center",
      border: cleanBorder,
      borderColor: blueCheers,
      padding: 20,
      marginTop: 44,
      color: blueCheers,
      fontSize: 18,
      fontWeight: 600,
      borderRadius: 4,
      userSelect: "none",
      outline: 0,
      cursor: "pointer",
    },
  };

  const onDrop = useCallback((acceptedFiles) => {
    onLoaded(acceptedFiles);
    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "application/pdf",
  });

  return (
    <div {...getRootProps()} style={styles.container}>
      <input {...getInputProps()} />
      {isDragActive ? <p>Drop a PDF here</p> : <p>Drag a PDF here</p>}
    </div>
  );
}
