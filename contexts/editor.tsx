/* eslint-disable no-unused-vars */
import axios from "axios";
import {
  createContext,
  MutableRefObject,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MAX_BLOCKSIZE, MIN_BLOCKSIZE, paletteList } from "../constants";
import { InputEvent } from "../interfaces";
import upload from "../lib/ipfs/upload";
import getRgbaString from "../lib/utils/get-rgba-string";
import similarColor from "../lib/utils/similar-color";

type ImageSize = { width: number; height: number };

interface EditorContext {
  blocksize: number;
  handleChangeBlocksize: (e: InputEvent) => void;
  handleUpDownBlocksize: (action: "up" | "down") => void;
  grayscale: boolean;
  handleGrayscale: (e: InputEvent) => void;
  onPalette: boolean;
  handleOnPalette: (e: InputEvent) => void;
  currentPalette: number;
  selectedPalette: number[][];
  handleChangeCurrentPalette: (action: "normal" | "random") => void;
  targetImageSize: ImageSize;
  handleChangeTargetImageSize: (
    action: "width" | "height",
    value: number
  ) => void;
  handleChangeInputFile: (e: InputEvent) => void;
  canvasRef: MutableRefObject<HTMLCanvasElement>;
  fromImgRef: MutableRefObject<HTMLImageElement>;
  saveImage: () => void;
  uploadToIpfs: () => void;
  isLoadingUploadButton: boolean;
  ipfsHash: string;
  drawPoint: (e: any) => void;
  currentPointColor: string;
  setCurrentPointColor: (value: string) => void;
  onPixelToPixel: boolean;
  copyIpfsHash: () => void;
  shareUrl: string;
  pointSize: number;
  handleOnChangePointSize: (e: any) => void;
  handleOnPixelToPixel: (e: any) => void;
  imageFile: File | undefined;
  generateDataURL: () => void;
  dataUrl: string;
}

const ContextEditor = createContext<EditorContext | null>(null);

const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [blocksize, setBlocksize] = useState(4);
  const [grayscale, setGrayscale] = useState(false);
  const [onPalette, setOnPalette] = useState(false);
  const [currentPalette, setCurrentPalette] = useState(0);
  const [targetImageSize, setTargetImageSize] = useState<ImageSize>({
    width: 0,
    height: 0,
  });
  const [isLoadingUploadButton, setIsLoadingUploadButton] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [dataUrl, setDataUrl] = useState("");

  const [imageFile, setImageFile] = useState<File>();
  const [currentPointColor, setCurrentPointColor] = useState("black");
  const [pointSize, setPointSize] = useState(1);

  const [onPixelToPixel, setOnPixelToPixel] = useState(false);
  // Source of image input
  const fromImgRef = useRef<HTMLImageElement>(undefined!);
  // Canvas used to represent image in the editor
  const canvasRef = useRef<HTMLCanvasElement>(undefined!);
  // Canvas used to store image in the original size;
  const preCanvasRef = useRef<HTMLCanvasElement>(undefined!);

  const handleChangeBlocksize = (e: InputEvent) => {
    setBlocksize(e.target.valueAsNumber);
  };

  const handleUpDownBlocksize = (action: "up" | "down") => {
    if (action === "up") {
      if (blocksize === MAX_BLOCKSIZE) return;
      setBlocksize((v) => v + 1);
    }
    if (action === "down") {
      if (blocksize === MIN_BLOCKSIZE) return;
      setBlocksize((v) => v - 1);
    }
  };

  const handleGrayscale = (e: InputEvent) => {
    if (onPalette) setOnPalette(false);
    if (onPixelToPixel) setOnPixelToPixel(false);
    setGrayscale(e.target.checked);
  };

  const handleOnPalette = (e: InputEvent) => {
    if (grayscale) setGrayscale(false);
    if (onPixelToPixel) setOnPixelToPixel(false);
    setOnPalette(e.target.checked);
  };

  const selectedPalette = useMemo(() => {
    const _currentPalette = paletteList[currentPalette]!;
    setCurrentPointColor(getRgbaString(_currentPalette[0]!));
    return _currentPalette;
  }, [currentPalette]);

  const handleChangeCurrentPalette = (action: "normal" | "random") => {
    if (action === "normal") {
      setCurrentPalette((v) => {
        if (v === paletteList.length - 1) return 0;
        return v + 1;
      });
    }
    if (action === "random") {
      const random = Math.floor(Math.random() * 100) % 99;
      setCurrentPalette(random);
    }
  };

  const handleChangeTargetImageSize = (
    action: "width" | "height",
    value: number
  ) => {
    if (isNaN(value) || value === 0) {
      setTargetImageSize({
        width: fromImgRef.current.width,
        height: fromImgRef.current.height,
      });
      return;
    }
    switch (action) {
      case "width":
        setTargetImageSize((v) => {
          if (v.width !== 0) {
            const ratio = v.height / v.width;
            return {
              width: value,
              height: value * ratio,
            };
          } else return v;
        });
        break;
      case "height":
        setTargetImageSize((v) => {
          if (v.height !== 0) {
            const ratio = v.width / v.height;
            return {
              width: value * ratio,
              height: value,
            };
          } else return v;
        });
        break;
      default:
        break;
    }
  };

  const handleChangeInputFile = (e: InputEvent) => {
    setIpfsHash("");
    const rawImage = e.target?.files?.[0];
    if (!rawImage) return;
    setImageFile(rawImage);
    setTargetImageSize({ width: 0, height: 0 });
    if (!fromImgRef.current) {
      fromImgRef.current = new Image();
    }
    fromImgRef.current.src = URL.createObjectURL(rawImage);
    fromImgRef.current.onload = async () => {
      setTargetImageSize({
        width: fromImgRef.current.width,
        height: fromImgRef.current.height,
      });
      drawPreCanvas();
      drawCanvas(true);
    };
    fromImgRef.current.id = rawImage.name;
  };

  const handleOnPixelToPixel = (e: InputEvent) => {
    setOnPixelToPixel(e.target.checked);
    if (e.target.checked && !onPalette) {
      setOnPalette(e.target.checked);
      if (grayscale) {
        setGrayscale(false);
      }
    }
  };

  const handleOnChangePointSize = (e: InputEvent) => {
    // Obtener el valor ingresado por el usuario
    const inputValue = e.target.value;

    // Filtrar solo los caracteres numéricos
    const numericValue = inputValue.replace(/\D/g, "");

    // Convertir el valor numérico a un entero
    const intValue = parseInt(numericValue);

    // Asegurarse de que el valor esté dentro del rango de 1 a 100
    const clampedValue = Math.max(1, Math.min(intValue, 100));

    // Actualizar el valor del input con el valor filtrado y clamped
    setPointSize(clampedValue);
  };

  function drawPreCanvas() {
    if (!preCanvasRef.current) {
      preCanvasRef.current = document.createElement("canvas");
    }
    const ctxAux = preCanvasRef.current.getContext("2d")!;
    const scale = blocksize * 0.01;
    const scaleW = fromImgRef.current.width * scale;
    const scaleH = fromImgRef.current.height * scale;

    preCanvasRef.current.width = fromImgRef.current.width;
    preCanvasRef.current.height = fromImgRef.current.height;

    ctxAux.drawImage(fromImgRef.current, 0, 0, scaleW, scaleH);
  }

  function drawCanvas(resize?: boolean) {
    const scale = blocksize * 0.01;
    const ctx = canvasRef.current.getContext("2d")!;
    if (resize) {
      let ratio = 1;
      if (fromImgRef.current.height > window.screen.height / 2) {
        ratio = window.screen.height / 2 / fromImgRef.current.height;
      }
      if (
        canvasRef.current.parentElement?.clientWidth &&
        fromImgRef.current.width > canvasRef.current.parentElement.clientWidth
      ) {
        let ratioB =
          canvasRef.current.parentElement.clientWidth /
          fromImgRef.current.width;
        ratio = Math.min(ratio, ratioB);
      }

      canvasRef.current.width = fromImgRef.current.width * ratio;
      canvasRef.current.height = fromImgRef.current.height * ratio;
    }
    const newImageData = new ImageData(
      canvasRef.current.width,
      canvasRef.current.height
    );
    ctx.putImageData(newImageData, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      preCanvasRef.current,
      0,
      0,
      fromImgRef.current.width * scale,
      fromImgRef.current.height * scale,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    if (grayscale) {
      convertToGrayscale();
    }
    if (onPalette) {
      convertToPalette();
    }
  }

  function convertToGrayscale() {
    const ctx = canvasRef.current.getContext("2d")!;
    const imgPixels = ctx.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    for (let y = 0; y < imgPixels.height; y++) {
      for (let x = 0; x < imgPixels.width; x++) {
        const i = y * 4 * imgPixels.width + x * 4;

        const a = imgPixels.data[i]!;
        const b = imgPixels.data[i + 1]!;
        const c = imgPixels.data[i + 2]!;
        const avg = (a + b + c) / 3;
        imgPixels.data[i] = avg;
        imgPixels.data[i + 1] = avg;
        imgPixels.data[i + 2] = avg;
      }
    }
    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
  }

  function convertToPalette() {
    const ctx = canvasRef.current.getContext("2d")!;
    const imgPixels = ctx.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    for (let y = 0; y < imgPixels.height; y++) {
      for (let x = 0; x < imgPixels.width; x++) {
        const i = y * 4 * imgPixels.width + x * 4;

        const a = imgPixels.data[i]!;
        const b = imgPixels.data[i + 1]!;
        const c = imgPixels.data[i + 2]!;

        const finalColor = similarColor([a, b, c], currentPalette);
        imgPixels.data[i] = finalColor[0]!;
        imgPixels.data[i + 1] = finalColor[1]!;
        imgPixels.data[i + 2] = finalColor[2]!;
      }
    }
    ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
  }

  function getTargetImage() {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d")!;

    tempCanvas.width = targetImageSize.width;
    tempCanvas.height = targetImageSize.height;

    tempCtx.drawImage(
      canvasRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
      0,
      0,
      targetImageSize.width,
      targetImageSize.height
    );
    return tempCanvas;
  }

  function saveImage() {
    const tempCanvas = getTargetImage();
    const link = document.createElement("a");
    let quality: number | undefined = undefined;
    if (
      imageFile?.type === "image/jpg" ||
      imageFile?.type === "image/jpeg" ||
      imageFile?.type === "image/webp"
    ) {
      quality = 1;
    }
    link.download = imageFile?.name!;
    link.href = tempCanvas
      .toDataURL(imageFile?.type!, quality)
      .replace(imageFile?.type!, "image/octet-stream");
    link.click();
  }

  function generateDataURL() {
    const tempCanvas = getTargetImage();
    let quality: number | undefined = undefined;
    if (
      imageFile?.type === "image/jpg" ||
      imageFile?.type === "image/jpeg" ||
      imageFile?.type === "image/webp"
    ) {
      quality = 1;
    }
    setDataUrl(tempCanvas.toDataURL(imageFile?.type!, quality));
  }

  const drawPoint = useCallback(
    (e: any) => {
      if (!onPixelToPixel) return;
      var ctx = canvasRef.current.getContext("2d")!;
      //ctx.beginPath();

      let divisor = 0.01 * blocksize;
      let sizeW =
        Math.round(
          (canvasRef.current.width / (fromImgRef.current.width * divisor)) * 10
        ) / 10;
      let sizeH =
        Math.round(
          (canvasRef.current.height / (fromImgRef.current.height * divisor)) *
            10
        ) / 10;
      console.log(sizeW);
      console.log(sizeH);
      let positionsX: number[] = [];
      let positionsY: number[] = [];

      for (let i = 0; i < fromImgRef.current.width * divisor; i++) {
        if (i == 0) {
          positionsX[i] = 0;
        } else {
          positionsX[i] = positionsX[i - 1]! + sizeW;
        }
      }
      for (let i = 0; i < fromImgRef.current.height * divisor; i++) {
        if (i == 0) {
          positionsY[i] = 0;
        } else {
          positionsY[i] = positionsY[i - 1]! + sizeH;
        }
      }

      let a = positionsX.find((value) => e.nativeEvent.offsetX < value);
      let b = positionsY.find((value) => e.nativeEvent.offsetY < value);

      if (!a) {
        a = canvasRef.current.width;
      }
      if (!b) {
        b = canvasRef.current.height;
      }
      ctx.fillStyle = currentPointColor;
      ctx.fillRect(a - sizeW, b - sizeH, sizeW * 1.005, sizeH * 1.005);
    },
    [blocksize, currentPointColor, onPixelToPixel]
  );

  function uploadToIpfs() {
    const tempCanvas = getTargetImage();
    setIsLoadingUploadButton(true);
    setShareUrl("");
    setIpfsHash("");
    tempCanvas.toBlob(async (blob) => {
      const cid = await upload(blob!);
      try {
        const { data } = await axios.post("/api/item", {
          ipfsCid: cid,
          width: tempCanvas.width,
          height: tempCanvas.height,
        });
        setShareUrl(`${window.location.origin}/post/${data.insertedId}`);
        setIpfsHash(cid);
        setIsLoadingUploadButton(false);
      } catch (error) {
        setIsLoadingUploadButton(false);
      }
    });
  }

  function copyIpfsHash() {
    if (!ipfsHash) return;
    navigator.clipboard.writeText(ipfsHash);
  }

  useEffect(() => {
    if (!fromImgRef.current) return;
    drawPreCanvas();
    drawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocksize]);

  useEffect(() => {
    if (!fromImgRef.current) return;
    drawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grayscale, onPalette, currentPalette]);

  return (
    <ContextEditor.Provider
      value={{
        blocksize,
        handleChangeBlocksize,
        handleUpDownBlocksize,
        grayscale,
        handleGrayscale,
        onPalette,
        handleOnPalette,
        currentPalette,
        selectedPalette,
        handleChangeCurrentPalette,
        targetImageSize,
        handleChangeTargetImageSize,
        handleChangeInputFile,
        canvasRef,
        fromImgRef,
        saveImage,
        uploadToIpfs,
        isLoadingUploadButton,
        ipfsHash,
        drawPoint,
        currentPointColor,
        setCurrentPointColor,
        onPixelToPixel,
        handleOnPixelToPixel,
        copyIpfsHash,
        shareUrl,
        pointSize,
        handleOnChangePointSize,
        imageFile,
        generateDataURL,
        dataUrl,
      }}
    >
      {children}
    </ContextEditor.Provider>
  );
};

const useEditor = () => useContext(ContextEditor)!;
export { useEditor, EditorProvider };
