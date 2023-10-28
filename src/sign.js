import "./App.css";
import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Drop from "./Drop";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument, rgb } from "pdf-lib";
import { blobToURL } from "./utils/Utils";
import PagingControl from "./components/PagingControl";
import { AddSigDialog } from "./components/AddSigDialog";
import { BigButton } from "./components/BigButton";
import DraggableSignature from "./components/DraggableSignature";
import DraggableText from "./components/DraggableText";
import dayjs from "dayjs";
import { blueCheers, grey, white } from "./utils/colors";
import addDateIcon from './icons/addDate.png';
import addSignIcon from './icons/addSign.png';
import addTextIcon from './icons/addText.png';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function Sign() {
  const { parametro, pdfLink } = useParams();

  useEffect(() => {
    if (pdfLink) {
    // URL of the existing PDF
    const pdfUrl = decodeURIComponent(
      pdfLink
    );

    const fetchData = async () => {
      try {
        // Fetch the existing PDF from the URL
        const response = await fetch(pdfUrl);
        const pdfBytes = await response.arrayBuffer();

        // Create a new PDF document
        const pdfDoc = await PDFDocument.load(pdfBytes);
        // Serialize the modified PDF
        const modifiedPdfBytes = await pdfDoc.save();


        // Create a Blob from the Uint8Array
        const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

        // Create a temporary URL for the Blob
        // const tempUrl = URL.createObjectURL(blob);

        const URL = await blobToURL(blob);
                  setPdf(URL);
                  console.log(URL)

        // setPdf(tempUrl);
      } catch (error) {
        console.error('Error creating the PDF:', error);
      }
    };

    fetchData();
  }
  }, [pdfLink]);
  
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
      backgroundColor: white,
      borderLeft: '1px solid',
      borderColor: grey,
      paddingTop: 16,
      maxWidth: 370,
      display: 'flex',
      alignItems: 'start',
      justifyContent: 'center',
      alignContent: 'start',
      gap: 8,
      fontSize: '14px',
      color: blueCheers,
      flexWrap: 'wrap',
      position: 'fixed',
      zIndex: 2,
      right: 0,
      top: 76,
      height: '91vh'
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
                      icon={addSignIcon}
                      onClick={() => setSignatureDialogVisible(true)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100px',
                        height: '100px',
                        whiteSpace: 'nowrap'
                      }}
                    />
                  ) : null}

                  <BigButton
                    marginRight={8}
                    title={"Add Date"}
                    icon={addDateIcon}
                    onClick={() => setTextInputVisible("date")}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100px',
                      height: '100px'
                    }}
                  />

                  <BigButton
                    marginRight={8}
                    title={"Add Text"}
                    icon={addTextIcon}
                    onClick={() => setTextInputVisible(true)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100px',
                      height: '100px'
                    }}
                  />
                  <div style={{
                    width: '100%',
                    display: 'flex',
                    padding: '0 14px'
                  }}>

                  <BigButton
                    marginRight={8}
                    title={"Reset"}
                    style={{
                      width: '100%',
                      padding: '8px 0'
                    }}
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
                      style={{
                        backgroundColor: blueCheers,
                        color: white,
                        width: '100%',
                        fontWeight: 'bold',
                        padding: '8px 0'
                      }}
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

                        const y =
                          documentRef.current.clientHeight -
                          (position.y +
                            12 * scale -
                            position.offsetY -
                            documentRef.current.offsetTop);
                        const x =
                          position.x -
                          166 -
                          position.offsetX -
                          documentRef.current.offsetLeft;

                        // new XY in relation to actual document size
                        const newY =
                          (y * originalHeight) /
                          documentRef.current.clientHeight;
                        const newX =
                          (x * originalWidth) / documentRef.current.clientWidth;

                        const pdfDoc = await PDFDocument.load(pdf);

                        const pages = pdfDoc.getPages();
                        const firstPage = pages[pageNum];

                        firstPage.drawText(text, {
                          x: newX,
                          y: newY,
                          size: 20 * scale,
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

                        const y =
                          documentRef.current.clientHeight -
                          (position.y -
                            position.offsetY +
                            64 -
                            documentRef.current.offsetTop);
                        const x =
                          position.x -
                          160 -
                          position.offsetX -
                          documentRef.current.offsetLeft;

                        // new XY in relation to actual document size
                        const newY =
                          (y * originalHeight) /
                          documentRef.current.clientHeight;
                        const newX =
                          (x * originalWidth) / documentRef.current.clientWidth;

                        const pdfDoc = await PDFDocument.load(pdf);

                        const pages = pdfDoc.getPages();
                        const firstPage = pages[pageNum];

                        const pngImage = await pdfDoc.embedPng(signatureURL);
                        const pngDims = pngImage.scale(scale * 0.3);

                        firstPage.drawImage(pngImage, {
                          x: newX,
                          y: newY,
                          width: pngDims.width,
                          height: pngDims.height,
                        });

                        if (autoDate) {
                          firstPage.drawText(
                            `Signed ${dayjs().format("M/d/YYYY HH:mm:ss ZZ")}`,
                            {
                              x: newX,
                              y: newY - 10,
                              size: 14 * scale,
                              color: rgb(0.074, 0.545, 0.262),
                            },
                          );
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
