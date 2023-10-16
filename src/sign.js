import "./App.css";
import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Drop from "./Drop";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, rgb } from "pdf-lib";
import { blobToURL } from "./utils/Utils";
import PagingControl from "./components/PagingControl";
import { AddSigDialog } from "./components/AddSigDialog";
import { Header } from "./Header";
import { BigButton } from "./components/BigButton";
import DraggableSignature from "./components/DraggableSignature";
import DraggableText from "./components/DraggableText";
import dayjs from "dayjs";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function Sign() {
  const { parametro } = useParams();
  const styles = {
    container: {
      maxWidth: 900,
      margin: "0 auto",
    },
    sigBlock: {
      display: "inline-block",
      border: "1px solid #000",
    },
    documentBlock: {
      maxWidth: 800,
      margin: "20px auto",
      marginTop: 8,
      border: "1px solid #999",
    },
    controls: {
      maxWidth: 800,
      margin: "0 auto",
      marginTop: 8,
    },
  };

  async function sendPDFToWebhook(pdf) {
    try {
      // Define la URL de tu webhook
      const webhookUrl =
        "https://lucianacheerss.bubbleapps.io/version-test/api/1.1/wf/pdf";
      const webhookUrlive =
        "https://lucianacheerss.bubbleapps.io/api/1.1/wf/pdf";

      // Realiza una solicitud POST al webhook con los datos del PDF
      const webhookResponse = await axios.post(webhookUrl, {
        id: parametro,
        pdf: "Base64-encoded binary " + pdf,
      });

      const webhookResponseLive = await axios.post(webhookUrlive, {
        id: parametro,
        pdf: "Base64-encoded binary " + pdf,
      });

      // Maneja la respuesta del webhook si es necesario
      console.log("Webhook Response:", webhookResponse.data);
      console.log("Webhook Response:", webhookResponseLive.data);
    } catch (error) {
      console.error("Error al enviar el PDF al webhook:", error);
    }
  }

  const [pdf, setPdf] = useState(null);
  const [autoDate, setAutoDate] = useState(true);
  const [signatureURL, setSignatureURL] = useState(null);
  const [position, setPosition] = useState(null);
  const [signatureDialogVisible, setSignatureDialogVisible] = useState(false);
  const [textInputVisible, setTextInputVisible] = useState(false);
  const [pageNum, setPageNum] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageDetails, setPageDetails] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const documentRef = useRef(null);

  return (
    <div>
      <Header />
      <div style={styles.container}>
        {showConfirmation ? (
          <div>
            <div className="confirmation-message">
              <p>El documento se guardó con éxito.</p>
            </div>
            <div className="button-div">
              <button
                className="volver-button"
                onClick={() => {
                  window.location.href =
                    "https://app.cheerscontracts.com/dashboard";
                }}
              >
                Volver
              </button>
            </div>
          </div>
        ) : (
          <div>
            {signatureDialogVisible ? (
              <AddSigDialog
                autoDate={autoDate}
                setAutoDate={setAutoDate}
                onClose={() => setSignatureDialogVisible(false)}
                onConfirm={(url) => {
                  setSignatureURL(url);
                  setSignatureDialogVisible(false);
                }}
              />
            ) : null}

            {!pdf ? (
              <Drop
                onLoaded={async (files) => {
                  const URL = await blobToURL(files[0]);
                  setPdf(URL);
                }}
              />
            ) : null}
            {pdf ? (
              <div>
                <div style={styles.controls}>
                  {!signatureURL ? (
                    <BigButton
                      marginRight={8}
                      title={"Add signature"}
                      onClick={() => setSignatureDialogVisible(true)}
                    />
                  ) : null}

                  <BigButton
                    marginRight={8}
                    title={"Add Date"}
                    onClick={() => setTextInputVisible("date")}
                  />

                  <BigButton
                    marginRight={8}
                    title={"Add Text"}
                    onClick={() => setTextInputVisible(true)}
                  />
                  <BigButton
                    marginRight={8}
                    title={"Reset"}
                    onClick={() => {
                      setTextInputVisible(false);
                      setSignatureDialogVisible(false);
                      setSignatureURL(null);
                      setPdf(null);
                      setTotalPages(0);
                      setPageNum(0);
                      setPageDetails(null);
                    }}
                  />
                  {pdf ? (
                    <BigButton
                      marginRight={8}
                      inverted={true}
                      title={"Confirm"} // Cambia el título según tus necesidades
                      onClick={() => {
                        if (pdf) {
                          sendPDFToWebhook(pdf)
                            .then(() => {
                              setShowConfirmation(true);
                            })
                            .catch((error) => {
                              console.error(
                                "Error al enviar el PDF al webhook:",
                                error,
                              );
                            });
                        }
                      }}
                    />
                  ) : null}
                </div>
                <div ref={documentRef} style={styles.documentBlock}>
                  {textInputVisible ? (
                    <DraggableText
                      initialText={
                        textInputVisible === "date"
                          ? dayjs().format("M/d/YYYY")
                          : null
                      }
                      onCancel={() => setTextInputVisible(false)}
                      onEnd={setPosition}
                      onSet={async (text) => {
                        const { originalHeight, originalWidth } = pageDetails;
                        const scale =
                          originalWidth / documentRef.current.clientWidth;

                        const y = (position.y - position.offsetY + 64) * scale;
                        const x = position.x - position.offsetX;

                        const pdfDoc = await PDFDocument.load(pdf);

                        const pages = pdfDoc.getPages();
                        const firstPage = pages[pageNum];

                        firstPage.drawText(text, {
                          x: x,
                          y: y,
                          size: 14,
                        });

                        const pdfBytes = await pdfDoc.save();
                        const blob = new Blob([new Uint8Array(pdfBytes)]);

                        const URL = await blobToURL(blob);
                        setPdf(URL);
                        setPosition(null);
                        setTextInputVisible(false);
                      }}
                    />
                  ) : null}
                  {signatureURL ? (
                    <DraggableSignature
                      url={signatureURL}
                      onCancel={() => {
                        setSignatureURL(null);
                      }}
                      onSet={async () => {
                        const { originalHeight, originalWidth } = pageDetails;
                        const scale =
                          originalWidth / documentRef.current.clientWidth;

                        const y = (position.y - position.offsetY + 64) * scale;
                        const x = position.x - position.offsetX;

                        const pdfDoc = await PDFDocument.load(pdf);

                        const pages = pdfDoc.getPages();
                        const firstPage = pages[pageNum];

                        const pngImage = await pdfDoc.embedPng(signatureURL);
                        const pngDims = pngImage.scale(scale * 0.3);

                        firstPage.drawImage(pngImage, {
                          x: x,
                          y: y,
                          width: pngDims.width,
                          height: pngDims.height,
                        });

                        if (autoDate) {
                          const dateText = `Signed ${dayjs().format(
                            "M/d/YYYY HH:mm:ss ZZ",
                          )}`;
                          firstPage.drawText(dateText, {
                            x: x,
                            y: y - 10,
                            size: 14,
                            color: rgb(0.074, 0.545, 0.262),
                          });
                        }

                        const pdfBytes = await pdfDoc.save();
                        const blob = new Blob([new Uint8Array(pdfBytes)]);

                        const URL = await blobToURL(blob);
                        setPdf(URL);
                        setPosition(null);
                        setSignatureURL(null);
                      }}
                      onEnd={setPosition}
                    />
                  ) : null}
                  <Document
                    file={pdf}
                    onLoadSuccess={(data) => {
                      setTotalPages(data.numPages);
                    }}
                  >
                    <Page
                      pageNumber={pageNum + 1}
                      width={800}
                      height={1200}
                      onLoadSuccess={(data) => {
                        setPageDetails(data);
                      }}
                    />
                  </Document>
                </div>
                <PagingControl
                  pageNum={pageNum}
                  setPageNum={setPageNum}
                  totalPages={totalPages}
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sign;
