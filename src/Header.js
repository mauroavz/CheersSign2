import { primary45 } from "./utils/colors";
import image from "./Cheers.svg";

export function Header() {
  const styles = {
    container: {
      backgroundColor: "#FFFFFF",
      color: "#FFF",
      padding: 12,
      fontWeight: 600,
      justifyContent: "center",
      borderBottom: "1px solid rgb(212, 212, 212)",
      height: "50px",
      alignItems: "center",
    },
    content: {
      textAlign: "center",
    },
    imagen: {
      with: "150px",
      height: "40px",
    },
  };
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <img src={image} alt="asd" style={styles.imagen} />
      </div>
    </div>
  );
}
