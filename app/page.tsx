"use client"
import type React from "react"
import { useState, useRef, useCallback, useMemo } from "react"
import { useWindowSize, useIsMobile, useIsTablet, useIsLaptop, useIsDesktop } from "@/hooks/use-window-size"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Cable,
  Circle,
  Type,
  Settings,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Trash2,
  MousePointer,
  Hand,
  Pencil,
  Square,
  Edit3,
  FileImage,
  FileText,
  Layers,
  Menu,
  X,
  HelpCircle,
  Home,
  Download,
} from "lucide-react"

// Configuración para evitar prerendering estático
export const dynamic = 'force-dynamic'

interface BobinaParams {
  diametro: number
  alturaTotal: number
  alturaBobinado: number
  alturaTubo: number
  espesorTubo: number
  material: string
  positionY: number
  positionX: number
  zoom: number
  rotation: number
  capas: number
  windingPositionY: number
  impedancia: number
}

interface BobinaTemplate {
  id: string
  name: string
  brand: string
  category: string
  description: string
  params: BobinaParams
  specs: {
    power: string
    impedance: string
    frequency: string
    application: string
    temperature: string
    resistance: string
    layers: string
    wireGauge: string
  }
  popular?: boolean
}

interface InteractiveElement {
  id: string
  type: "measurement" | "label" | "cable" | "hole" | "text" | "dimension"
  x: number
  y: number
  width?: number
  height?: number
  text: string
  value?: number
  unit?: string
  lineEndX?: number
  lineEndY?: number
  measurementType?: "horizontal" | "vertical" | "diagonal" | "point" | "radius" | "angle"
  measurement?: number
  fontSize?: number
  color?: string
  backgroundColor?: string
  editable?: boolean
  precision?: number
  isDragging?: boolean
  isEditing?: boolean
  strokeWidth?: number
  terminalType?: "standard" | "spade" | "ring" | "pin"
}

interface AppSettings {
  darkMode: boolean
  liveMode: boolean
  showGrid: boolean
  showMeasurements: boolean
  showHandles: boolean
  autoSave: boolean
  precision: number
  units: "mm" | "cm" | "in"
}

export default function BobinaDesigner() {
  // Hooks para responsive design
  const { width: windowWidth, height: windowHeight } = useWindowSize()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isLaptop = useIsLaptop()
  const isDesktop = useIsDesktop()

  // Estados principales
  const [params, setParams] = useState<BobinaParams>({
    diametro: 100,
    alturaTotal: 150,
    alturaBobinado: 120,
    alturaTubo: 140,
    espesorTubo: 5,
    material: "aluminio",
    positionY: 0,
    positionX: 0,
    zoom: 1,
    rotation: 0,
    capas: 2,
    windingPositionY: 0,
    impedancia: 8,
  })

  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    liveMode: false,
    showGrid: true,
    showMeasurements: true,
    showHandles: true,
    autoSave: true,
    precision: 1,
    units: "mm",
  })

  const [elements, setElements] = useState<InteractiveElement[]>([])
  const [currentTool, setCurrentTool] = useState<string>("pointer")
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 })
  const [drawEnd, setDrawEnd] = useState({ x: 0, y: 0 })
  const [activeTab, setActiveTab] = useState("tools")
  const [undoStack, setUndoStack] = useState<BobinaParams[]>([])
  const [redoStack, setRedoStack] = useState<BobinaParams[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [galleryFilter, setGalleryFilter] = useState<string>("all")
  const [editingElement, setEditingElement] = useState<string | null>(null)
  const [tempText, setTempText] = useState<string>("")
  const [isMovingWinding, setIsMovingWinding] = useState(false)
  const [windingDragStart, setWindingDragStart] = useState({ y: 0 })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resizingElement, setResizingElement] = useState<string | null>(null)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const svgRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  // Función para ir al inicio
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Función para manejar el newsletter
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return

    setNewsletterStatus("sending")

    try {
      // Simular envío de email
      const emailBody = `
Nueva suscripción al newsletter de VoiceCoil Designer:

Email: ${newsletterEmail}
Fecha: ${new Date().toLocaleString()}
Aplicación: VoiceCoil Designer
Desarrollador: Armando Ovalle J
      `

      // Crear enlace mailto
      const mailtoLink = `mailto:ovalle_938@hotmail.com?subject=Nueva suscripción - VoiceCoil Designer&body=${encodeURIComponent(emailBody)}`

      // Abrir cliente de correo
      window.location.href = mailtoLink

      setNewsletterStatus("success")
      setNewsletterEmail("")

      setTimeout(() => {
        setNewsletterStatus("idle")
      }, 3000)
    } catch (error) {
      setNewsletterStatus("error")
      setTimeout(() => {
        setNewsletterStatus("idle")
      }, 3000)
    }
  }

  // Materiales simplificados
  const materials = useMemo(
    () => ({
      aluminio: {
        name: "Aluminio",
        color: "#E8E8E8",
        properties: "Excelente conductividad, ligero",
      },
      cobre: {
        name: "Cobre",
        color: "#B87333",
        properties: "Máxima conductividad, dúctil",
      },
      kapton: {
        name: "Kapton",
        color: "#FFA500",
        properties: "Aislante, alta temperatura",
      },
      til: {
        name: "TIL (Papel)",
        color: "#D2B48C",
        properties: "Aislante económico",
      },
      fibraVidrio: {
        name: "Fibra de Vidrio",
        color: "#F0F8FF",
        properties: "Aislante, resistente",
      },
    }),
    [],
  )

  // Opciones de impedancia comunes
  const impedanciaOptions = [1, 2, 4, 8, 16, 32]

  // Plantillas expandidas con todos los tamaños
  const bobinaTemplates: BobinaTemplate[] = useMemo(
    () => [
      // Drivers de compresión
      {
        id: "rcf-nd350",
        name: "ND350",
        brand: "RCF",
        category: "Driver",
        description: "Driver de compresión profesional de 1.4 pulgadas",
        params: {
          diametro: 35,
          alturaTotal: 45,
          alturaBobinado: 38,
          alturaTubo: 42,
          espesorTubo: 2.5,
          material: "kapton",
          positionY: 0,
          positionX: 0,
          zoom: 1,
          rotation: 0,
          capas: 2,
          windingPositionY: 0,
          impedancia: 8,
        },
        specs: {
          power: "80W RMS",
          impedance: "8Ω",
          frequency: "1.5kHz - 20kHz",
          application: "Compresión HF",
          temperature: "-10°C a +50°C",
          resistance: "6.4Ω @ 1kHz",
          layers: "2 capas",
          wireGauge: "AWG 32",
        },
        popular: true,
      },
      {
        id: "driver-25mm",
        name: "Driver 25mm",
        brand: "Generic",
        category: "Driver",
        description: "Driver de compresión de 25mm para tweeters",
        params: {
          diametro: 25,
          alturaTotal: 30,
          alturaBobinado: 25,
          alturaTubo: 28,
          espesorTubo: 1.5,
          material: "kapton",
          positionY: 0,
          positionX: 0,
          zoom: 1,
          rotation: 0,
          capas: 1,
          windingPositionY: 0,
          impedancia: 8,
        },
        specs: {
          power: "50W RMS",
          impedance: "8Ω",
          frequency: "2kHz - 20kHz",
          application: "Tweeter",
          temperature: "-10°C a +50°C",
          resistance: "6.8Ω @ 1kHz",
          layers: "1 capa",
          wireGauge: "AWG 34",
        },
        popular: false,
      },
      {
        id: "driver-44mm",
        name: "Driver 44mm",
        brand: "Pro Audio",
        category: "Driver",
        description: "Driver de compresión de 44mm para medios-agudos",
        params: {
          diametro: 44,
          alturaTotal: 55,
          alturaBobinado: 48,
          alturaTubo: 52,
          espesorTubo: 3,
          material: "kapton",
          positionY: 0,
          positionX: 0,
          zoom: 1,
          rotation: 0,
          capas: 2,
          windingPositionY: 0,
          impedancia: 8,
        },
        specs: {
          power: "120W RMS",
          impedance: "8Ω",
          frequency: "800Hz - 18kHz",
          application: "Medios-Agudos",
          temperature: "-10°C a +60°C",
          resistance: "6.2Ω @ 1kHz",
          layers: "2 capas",
          wireGauge: "AWG 30",
        },
        popular: true,
      },

      // Woofers
      {
        id: "woofer-6-5",
        name: 'Woofer 6.5"',
        brand: "Custom",
        category: "Woofer",
        description: "Bobina para woofer de 6.5 pulgadas",
        params: {
          diametro: 38,
          alturaTotal: 45,
          alturaBobinado: 40,
          alturaTubo: 42,
          espesorTubo: 2,
          material: "aluminio",
          positionY: 0,
          positionX: 0,
          zoom: 1,
          rotation: 0,
          capas: 2,
          windingPositionY: 0,
          impedancia: 4,
        },
        specs: {
          power: "150W RMS",
          impedance: "4Ω",
          frequency: "45Hz - 4kHz",
          application: "Medios-Graves",
          temperature: "-10°C a +70°C",
          resistance: "3.2Ω @ 1kHz",
          layers: "2 capas",
          wireGauge: "AWG 26",
        },
        popular: false,
      },
      {
        id: "woofer-8",
        name: 'Woofer 8"',
        brand: "Custom",
        category: "Woofer",
        description: "Bobina para woofer de 8 pulgadas",
        params: {
          diametro: 50,
          alturaTotal: 60,
          alturaBobinado: 55,
          alturaTubo: 58,
          espesorTubo: 3,
          material: "aluminio",
          positionY: 0,
          positionX: 0,
          zoom: 1,
          rotation: 0,
          capas: 2,
          windingPositionY: 0,
          impedancia: 4,
        },
        specs: {
          power: "200W RMS",
          impedance: "4Ω",
          frequency: "40Hz - 3.5kHz",
          application: "Medios-Graves",
          temperature: "-10°C a +70°C",
          resistance: "3.0Ω @ 1kHz",
          layers: "2 capas",
          wireGauge: "AWG 24",
        },
        popular: true,
      },
      {
        id: "woofer-10",
        name: 'Woofer 10"',
        brand: "Custom",
        category: "Woofer",
        description: "Bobina para woofer de 10 pulgadas",
        params: {
          diametro: 63,
          alturaTotal: 75,
          alturaBobinado: 68,
          alturaTubo: 72,
          espesorTubo: 4,
          material: "aluminio",
          positionY: 0,
          positionX: 0,
          zoom: 1,
          rotation: 0,
          capas: 2,
          windingPositionY: 0,
          impedancia: 4,
        },
        specs: {
          power: "250W RMS",
          impedance: "4Ω",
          frequency: "35Hz - 3kHz",
          application: "Graves/Medios",
          temperature: "-10°C a +70°C",
          resistance: "3.1Ω @ 1kHz",
          layers: "2 capas",
          wireGauge: "AWG 22",
        },
        popular: true,
      },
      {
        id: "woofer-12",
        name: 'Woofer 12"',
        brand: "Custom",
        category: "Woofer",
        description: "Bobina para woofer de 12 pulgadas",
        params: {
          diametro: 76,
          alturaTotal: 85,
          alturaBobinado: 78,
          alturaTubo: 82,
          espesorTubo: 4,
          material: "aluminio",
          positionY: 0,
          positionX: 0,
          zoom: 1,
          rotation: 0,
          capas: 2,
          windingPositionY: 0,
          impedancia: 4,
        },
        specs: {
          power: "300W RMS",
          impedance: "4Ω",
          frequency: "35Hz - 3kHz",
          application: "Graves/Medios",
          temperature: "-10°C a +70°C",
          resistance: "3.2Ω @ 1kHz",
          layers: "2 capas",
          wireGauge: "AWG 20",
        },
        popular: true,
      },
      {
        id: "woofer-15",
        name: 'Woofer 15"',
        brand: "Pro Audio",
        category: "Woofer",
        description: "Bobina para woofer de 15 pulgadas",
        params: {
          diametro: 100,
          alturaTotal: 110,
          alturaBobinado: 100,
          alturaTubo: 105,
          espesorTubo: 5,
          material: "aluminio",
          positionY: 0,
          positionX: 0,
          zoom: 1,
          rotation: 0,
          capas: 3,
          windingPositionY: 0,
          impedancia: 4,
        },
        specs: {
          power: "500W RMS",
          impedance: "4Ω",
          frequency: "30Hz - 2.5kHz",
          application: "Graves",
          temperature: "-5°C a +80°C",
          resistance: "3.0Ω @ 1kHz",
          layers: "3 capas",
          wireGauge: "AWG 18",
        },
        popular: true,
      },

      // Subwoofers
      {
        id: "subwoofer-15",
        name: 'Subwoofer 15"',
        brand: "Pro Audio",
        category: "Subwoofer",
        description: "Bobina de alta potencia para subwoofer de 15 pulgadas",
        params: {
          diametro: 100,
          alturaTotal: 120,
          alturaBobinado: 110,
          alturaTubo: 115,
          espesorTubo: 5,
          material: "aluminio",
          positionY: 0,
          positionX: 0,
          zoom: 1,
          rotation: 0,
          capas: 4,
          windingPositionY: 0,
          impedancia: 2,
        },
        specs: {
          power: "800W RMS",
          impedance: "2Ω",
          frequency: "25Hz - 300Hz",
          application: "Subwoofer",
          temperature: "-5°C a +80°C",
          resistance: "1.6Ω @ 1kHz",
          layers: "4 capas",
          wireGauge: "AWG 16",
        },
        popular: true,
      },
      {
        id: "subwoofer-18",
        name: 'Subwoofer 18"',
        brand: "Pro Audio",
        category: "Subwoofer",
        description: "Bobina de alta potencia para subwoofer de 18 pulgadas",
        params: {
          diametro: 125,
          alturaTotal: 140,
          alturaBobinado: 120,
          alturaTubo: 135,
          espesorTubo: 6,
          material: "aluminio",
          positionY: 0,
          positionX: 0,
          zoom: 1,
          rotation: 0,
          capas: 4,
          windingPositionY: 0,
          impedancia: 2,
        },
        specs: {
          power: "1000W RMS",
          impedance: "2Ω",
          frequency: "20Hz - 200Hz",
          application: "Subwoofer",
          temperature: "-5°C a +80°C",
          resistance: "1.6Ω @ 1kHz",
          layers: "4 capas",
          wireGauge: "AWG 14",
        },
        popular: true,
      },
      {
        id: "subwoofer-21",
        name: 'Subwoofer 21"',
        brand: "Pro Audio",
        category: "Subwoofer",
        description: "Bobina de ultra alta potencia para subwoofer de 21 pulgadas",
        params: {
          diametro: 150,
          alturaTotal: 160,
          alturaBobinado: 140,
          alturaTubo: 155,
          espesorTubo: 7,
          material: "aluminio",
          positionY: 0,
          positionX: 0,
          zoom: 1,
          rotation: 0,
          capas: 6,
          windingPositionY: 0,
          impedancia: 1,
        },
        specs: {
          power: "1500W RMS",
          impedance: "1Ω",
          frequency: "18Hz - 150Hz",
          application: "Subwoofer Ultra",
          temperature: "0°C a +85°C",
          resistance: "0.8Ω @ 1kHz",
          layers: "6 capas",
          wireGauge: "AWG 12",
        },
        popular: false,
      },

      // Tweeters
      {
        id: "tweeter-20mm",
        name: "Tweeter 20mm",
        brand: "HiFi",
        category: "Tweeter",
        description: "Bobina para tweeter de domo de 20mm",
        params: {
          diametro: 20,
          alturaTotal: 25,
          alturaBobinado: 20,
          alturaTubo: 23,
          espesorTubo: 1,
          material: "kapton",
          positionY: 0,
          positionX: 0,
          zoom: 1,
          rotation: 0,
          capas: 1,
          windingPositionY: 0,
          impedancia: 8,
        },
        specs: {
          power: "30W RMS",
          impedance: "8Ω",
          frequency: "3kHz - 25kHz",
          application: "Tweeter",
          temperature: "-10°C a +50°C",
          resistance: "7.2Ω @ 1kHz",
          layers: "1 capa",
          wireGauge: "AWG 36",
        },
        popular: false,
      },
      {
        id: "tweeter-25mm",
        name: "Tweeter 25mm",
        brand: "HiFi",
        category: "Tweeter",
        description: "Bobina para tweeter de domo de 25mm",
        params: {
          diametro: 25,
          alturaTotal: 30,
          alturaBobinado: 25,
          alturaTubo: 28,
          espesorTubo: 1.5,
          material: "kapton",
          positionY: 0,
          positionX: 0,
          zoom: 1,
          rotation: 0,
          capas: 1,
          windingPositionY: 0,
          impedancia: 8,
        },
        specs: {
          power: "40W RMS",
          impedance: "8Ω",
          frequency: "2.5kHz - 22kHz",
          application: "Tweeter",
          temperature: "-10°C a +50°C",
          resistance: "6.8Ω @ 1kHz",
          layers: "1 capa",
          wireGauge: "AWG 34",
        },
        popular: true,
      },

      // Medios
      {
        id: "midrange-4",
        name: 'Midrange 4"',
        brand: "Studio",
        category: "Midrange",
        description: "Bobina para altavoz de medios de 4 pulgadas",
        params: {
          diametro: 32,
          alturaTotal: 40,
          alturaBobinado: 35,
          alturaTubo: 38,
          espesorTubo: 2,
          material: "cobre",
          positionY: 0,
          positionX: 0,
          zoom: 1,
          rotation: 0,
          capas: 2,
          windingPositionY: 0,
          impedancia: 8,
        },
        specs: {
          power: "100W RMS",
          impedance: "8Ω",
          frequency: "200Hz - 5kHz",
          application: "Medios",
          temperature: "-10°C a +60°C",
          resistance: "6.4Ω @ 1kHz",
          layers: "2 capas",
          wireGauge: "AWG 28",
        },
        popular: false,
      },
      {
        id: "midrange-5",
        name: 'Midrange 5"',
        brand: "Studio",
        category: "Midrange",
        description: "Bobina para altavoz de medios de 5 pulgadas",
        params: {
          diametro: 38,
          alturaTotal: 48,
          alturaBobinado: 42,
          alturaTubo: 45,
          espesorTubo: 2.5,
          material: "cobre",
          positionY: 0,
          positionX: 0,
          zoom: 1,
          rotation: 0,
          capas: 2,
          windingPositionY: 0,
          impedancia: 8,
        },
        specs: {
          power: "120W RMS",
          impedance: "8Ω",
          frequency: "150Hz - 4kHz",
          application: "Medios",
          temperature: "-10°C a +60°C",
          resistance: "6.2Ω @ 1kHz",
          layers: "2 capas",
          wireGauge: "AWG 26",
        },
        popular: true,
      },
    ],
    [],
  )

  // Cálculos optimizados - Responsive mejorado
  const calculations = useMemo(() => {
    let svgWidth: number
    let svgHeight: number

    if (isMobile) {
      // Móvil: Canvas más pequeño pero usable
      svgWidth = Math.min(windowWidth - 20, 400)
      svgHeight = Math.min(windowHeight * 0.6, 500)
    } else if (isTablet) {
      // Tablet: Canvas mediano
      svgWidth = Math.min(windowWidth - 100, 600)
      svgHeight = Math.min(windowHeight * 0.7, 700)
    } else if (isLaptop) {
      // Laptop: Canvas grande pero no excesivo
      svgWidth = Math.min(windowWidth - 400, 800)
      svgHeight = Math.min(windowHeight * 0.8, 800)
    } else {
      // Desktop: Canvas muy grande
      svgWidth = Math.min(windowWidth - 500, 1000)
      svgHeight = Math.min(windowHeight * 0.85, 900)
    }

    const scale = Math.min(svgWidth / (params.diametro + 150), svgHeight / (params.alturaTotal + 250)) * params.zoom
    const bobinaWidth = params.diametro * scale
    const bobinaHeight = params.alturaTubo * scale
    const bobinadoHeight = params.alturaBobinado * scale
    const centerX = svgWidth / 2 + params.positionX
    const centerY = svgHeight / 2 - 30 + params.positionY

    return {
      svgWidth,
      svgHeight,
      scale,
      bobinaWidth,
      bobinaHeight,
      bobinadoHeight,
      centerX,
      centerY,
      isMobile,
      isTablet,
      isLaptop,
      isDesktop,
    }
  }, [params, windowWidth, windowHeight, isMobile, isTablet, isLaptop, isDesktop])

  // Funciones simplificadas
  const saveStateForUndo = useCallback(() => {
    setUndoStack((prev) => [...prev.slice(-19), { ...params }])
    setRedoStack([])
  }, [params])

  const updateParam = useCallback(
    (key: keyof BobinaParams, value: number | string) => {
      if (!settings.liveMode) saveStateForUndo()
      setParams((prev) => ({ ...prev, [key]: value }))
    },
    [saveStateForUndo, settings.liveMode],
  )

  const updateSettings = useCallback((key: keyof AppSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  const loadTemplate = useCallback(
    (template: BobinaTemplate) => {
      saveStateForUndo()
      setParams(template.params)
      setSelectedTemplate(template.id)
      setElements([])
      setSelectedElement(null)
    },
    [saveStateForUndo],
  )

  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const prevState = undoStack[undoStack.length - 1]
      setRedoStack((prev) => [...prev, { ...params }])
      setParams(prevState)
      setUndoStack((prev) => prev.slice(0, -1))
    }
  }, [undoStack, params])

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1]
      setUndoStack((prev) => [...prev, { ...params }])
      setParams(nextState)
      setRedoStack((prev) => prev.slice(0, -1))
    }
  }, [redoStack, params])

  const moveBobin = useCallback(
    (direction: "up" | "down" | "left" | "right", amount = 10) => {
      saveStateForUndo()
      setParams((prev) => ({
        ...prev,
        positionY: prev.positionY + (direction === "up" ? -amount : direction === "down" ? amount : 0),
        positionX: prev.positionX + (direction === "left" ? -amount : direction === "right" ? amount : 0),
      }))
    },
    [saveStateForUndo],
  )

  const zoomBobin = useCallback(
    (zoomIn: boolean) => {
      saveStateForUndo()
      setParams((prev) => ({
        ...prev,
        zoom: Math.max(0.5, Math.min(3, prev.zoom + (zoomIn ? 0.1 : -0.1))),
      }))
    },
    [saveStateForUndo],
  )

  const resetView = useCallback(() => {
    saveStateForUndo()
    setParams((prev) => ({
      ...prev,
      positionX: 0,
      positionY: 0,
      zoom: 1,
      rotation: 0,
    }))
  }, [saveStateForUndo])

  // Función mejorada para detectar si se hizo clic en un elemento - Incluye agujeros arrastrables
  const getElementAtPosition = useCallback(
    (x: number, y: number): InteractiveElement | "winding" | null => {
      // Para otros elementos, permitir selección y arrastre de agujeros
      if (currentTool === "pointer") {
        // Buscar en orden inverso para obtener el elemento más arriba
        for (let i = elements.length - 1; i >= 0; i--) {
          const element = elements[i]

          if (element.type === "text") {
            // Para texto, usar un área aproximada
            const textWidth = element.text.length * (element.fontSize || 14) * 0.6
            const textHeight = element.fontSize || 14
            if (
              x >= element.x - 5 &&
              x <= element.x + textWidth + 5 &&
              y >= element.y - textHeight &&
              y <= element.y + 5
            ) {
              return element
            }
          } else if (element.type === "label") {
            // Para etiquetas, usar el rectángulo completo
            if (
              x >= element.x &&
              x <= element.x + (element.width || 100) &&
              y >= element.y &&
              y <= element.y + (element.height || 30)
            ) {
              return element
            }
          } else if (element.type === "hole") {
            // Para agujeros, usar distancia circular - AHORA ARRASTRABLES
            const centerX = element.x + (element.width || 20) / 2
            const centerY = element.y + (element.height || 20) / 2
            const radius = (element.width || 20) / 2
            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
            if (distance <= radius + 5) {
              return element
            }
          } else if (element.type === "measurement" || element.type === "cable") {
            // Para líneas, usar distancia a la línea
            const lineLength = Math.sqrt(
              Math.pow((element.lineEndX || element.x) - element.x, 2) +
                Math.pow((element.lineEndY || element.y) - element.y, 2),
            )
            if (lineLength > 0) {
              const distanceToLine =
                Math.abs(
                  ((element.lineEndY || element.y) - element.y) * x -
                    ((element.lineEndX || element.x) - element.x) * y +
                    (element.lineEndX || element.x) * element.y -
                    (element.lineEndY || element.y) * element.x,
                ) / lineLength

              if (distanceToLine <= 10) {
                return element
              }
            }
          }
        }
      }

      // SOLO verificar si se hizo clic en el bobinado (sección dorada) para arrastre después de verificar otros elementos
      const windingRect = {
        x: calculations.centerX - calculations.bobinaWidth / 2,
        y: calculations.centerY - calculations.bobinadoHeight / 2 + params.windingPositionY * calculations.scale,
        width: calculations.bobinaWidth,
        height: calculations.bobinadoHeight,
      }

      if (
        x >= windingRect.x &&
        x <= windingRect.x + windingRect.width &&
        y >= windingRect.y &&
        y <= windingRect.y + windingRect.height
      ) {
        return "winding"
      }

      return null
    },
    [elements, calculations, currentTool, params.windingPositionY],
  )

  // Función para detectar handles de redimensionamiento
  const getResizeHandle = useCallback((element: InteractiveElement, x: number, y: number): string | null => {
    if (element.type !== "hole") return null

    const centerX = element.x + (element.width || 20) / 2
    const centerY = element.y + (element.height || 20) / 2
    const radius = (element.width || 20) / 2

    // Handle en el borde derecho del círculo
    const rightHandleX = centerX + radius
    const rightHandleY = centerY

    if (Math.sqrt(Math.pow(x - rightHandleX, 2) + Math.pow(y - rightHandleY, 2)) <= 8) {
      return "resize"
    }

    return null
  }, [])

  const handleSvgMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      e.preventDefault()
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setDrawStart({ x, y })
      setDrawEnd({ x, y })

      if (currentTool === "pointer") {
        const clickedElement = getElementAtPosition(x, y)

        if (clickedElement === "winding") {
          // SOLO el bobinado se puede arrastrar
          setSelectedElement("winding")
          setIsMovingWinding(true)
          setWindingDragStart({ y })
          setIsDragging(true)
        } else if (clickedElement && typeof clickedElement === "object") {
          // Verificar si se hizo clic en un handle de redimensionamiento
          const handle = getResizeHandle(clickedElement, x, y)
          if (handle) {
            setResizingElement(clickedElement.id)
            setResizeHandle(handle)
            setIsDragging(true)
          } else {
            // Elementos seleccionados - agujeros y medidas ahora se pueden arrastrar
            setSelectedElement(clickedElement.id)
            if (clickedElement.type === "hole" || clickedElement.type === "measurement") {
              setIsDragging(true)
              setDragOffset({
                x: x - clickedElement.x,
                y: y - clickedElement.y,
              })
            }
          }
        } else {
          setSelectedElement(null)
          setIsDragging(false)
          setIsMovingWinding(false)
        }
      } else if (currentTool === "hand") {
        // Modo mano para mover la vista
        setIsDragging(true)
        setDragOffset({ x, y })
      } else {
        // Herramientas de dibujo
        setIsDrawing(true)
      }
    },
    [currentTool, getElementAtPosition, getResizeHandle],
  )

  const handleSvgMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setDrawEnd({ x, y })

      if (isDragging && currentTool === "pointer") {
        if (isMovingWinding) {
          // SOLO mover el bobinado verticalmente
          const deltaY = y - windingDragStart.y
          const maxMovement = (params.alturaTubo - params.alturaBobinado) / 2
          const newWindingPositionY = Math.max(
            -maxMovement,
            Math.min(maxMovement, params.windingPositionY + deltaY / calculations.scale),
          )

          setParams((prev) => ({
            ...prev,
            windingPositionY: newWindingPositionY,
          }))

          setWindingDragStart({ y })
        } else if (resizingElement && resizeHandle === "resize") {
          // Redimensionar agujero
          const element = elements.find((el) => el.id === resizingElement)
          if (element && element.type === "hole") {
            const centerX = element.x + (element.width || 20) / 2
            const centerY = element.y + (element.height || 20) / 2
            const newRadius = Math.max(5, Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)))
            const newSize = newRadius * 2

            setElements((prev) =>
              prev.map((el) =>
                el.id === resizingElement
                  ? {
                      ...el,
                      x: centerX - newRadius,
                      y: centerY - newRadius,
                      width: newSize,
                      height: newSize,
                    }
                  : el,
              ),
            )
          }
        } else if (selectedElement && selectedElement !== "winding") {
          const element = elements.find((el) => el.id === selectedElement)
          if (element && (element.type === "hole" || element.type === "measurement")) {
            // Permitir movimiento libre de agujeros y medidas sin restricciones
            const newX = Math.max(0, Math.min(calculations.svgWidth - (element.width || 20), x - dragOffset.x))
            const newY = Math.max(0, Math.min(calculations.svgHeight - (element.height || 20), y - dragOffset.y))

            if (element.type === "measurement") {
              // Para medidas, mover tanto el punto inicial como el final
              const deltaX = newX - element.x
              const deltaY = newY - element.y
              setElements((prev) =>
                prev.map((el) =>
                  el.id === selectedElement
                    ? {
                        ...el,
                        x: newX,
                        y: newY,
                        lineEndX: (el.lineEndX || el.x) + deltaX,
                        lineEndY: (el.lineEndY || el.y) + deltaY,
                      }
                    : el,
                ),
              )
            } else {
              setElements((prev) => prev.map((el) => (el.id === selectedElement ? { ...el, x: newX, y: newY } : el)))
            }
          }
        }
      } else if (isDragging && currentTool === "hand") {
        // Mover vista de la bobina
        const deltaX = x - dragOffset.x
        const deltaY = y - dragOffset.y

        setParams((prev) => ({
          ...prev,
          positionX: prev.positionX + deltaX,
          positionY: prev.positionY + deltaY,
        }))

        setDragOffset({ x, y })
      }
    },
    [
      isDragging,
      currentTool,
      isMovingWinding,
      windingDragStart,
      params.windingPositionY,
      params.alturaTubo,
      params.alturaBobinado,
      calculations.scale,
      dragOffset,
      resizingElement,
      resizeHandle,
      selectedElement,
      elements,
      calculations.svgWidth,
      calculations.svgHeight,
    ],
  )

  const handleSvgMouseUp = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.y

      if (isDrawing && currentTool !== "pointer" && currentTool !== "hand") {
        let newElement: InteractiveElement

        switch (currentTool) {
          case "text":
            newElement = {
              id: Date.now().toString(),
              type: "text",
              x: drawStart.x,
              y: drawStart.y,
              text: "Nuevo texto",
              fontSize: 14,
              color: "#000000",
              editable: true,
              isEditing: true,
            }
            setEditingElement(newElement.id)
            setTempText("Nuevo texto")
            break

          case "label":
            const width = Math.abs(x - drawStart.x) || 100
            const height = Math.abs(y - drawStart.y) || 30
            newElement = {
              id: Date.now().toString(),
              type: "label",
              x: Math.min(drawStart.x, x),
              y: Math.min(drawStart.y, y),
              width,
              height,
              text: "Nueva etiqueta",
              fontSize: 12,
              color: "#000000",
              backgroundColor: "#FFFFFF",
              editable: true,
            }
            break

          case "cable":
            newElement = {
              id: Date.now().toString(),
              type: "cable",
              x: drawStart.x,
              y: drawStart.y,
              lineEndX: x,
              lineEndY: y,
              text: "Cable",
              color: "#8B4513",
            }
            break

          case "hole":
            const radius = Math.sqrt(Math.pow(x - drawStart.x, 2) + Math.pow(y - drawStart.y, 2)) || 10
            newElement = {
              id: Date.now().toString(),
              type: "hole",
              x: drawStart.x - radius / 2,
              y: drawStart.y - radius / 2,
              width: radius,
              height: radius,
              text: "Agujero",
              color: "#333333",
            }
            break

          default:
            setIsDrawing(false)
            setIsDragging(false)
            setIsMovingWinding(false)
            setResizingElement(null)
            setResizeHandle(null)
            return
        }

        setElements((prev) => [...prev, newElement])
        setSelectedElement(newElement.id)
        setCurrentTool("pointer")
      }

      setIsDrawing(false)
      setIsDragging(false)
      setIsMovingWinding(false)
      setResizingElement(null)
      setResizeHandle(null)
    },
    [isDrawing, currentTool, drawStart, calculations.scale, settings.units],
  )

  // Manejo de doble clic para editar texto
  const handleSvgDoubleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const clickedElement = getElementAtPosition(x, y)

      if (clickedElement && (clickedElement.type === "text" || clickedElement.type === "label")) {
        setEditingElement(clickedElement.id)
        setTempText(clickedElement.text)
        setTimeout(() => {
          textInputRef.current?.focus()
          textInputRef.current?.select()
        }, 100)
      }
    },
    [getElementAtPosition],
  )

  const updateElementProperty = useCallback((id: string, property: string, value: any) => {
    setElements((prev) => prev.map((element) => (element.id === id ? { ...element, [property]: value } : element)))
  }, [])

  const deleteElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((element) => element.id !== id))
    setSelectedElement(null)
    setEditingElement(null)
  }, [])

  const deleteAllElements = useCallback(() => {
    setElements([])
    setSelectedElement(null)
    setEditingElement(null)
  }, [])

  // Finalizar edición de texto
  const finishTextEditing = useCallback(() => {
    if (editingElement && tempText.trim()) {
      updateElementProperty(editingElement, "text", tempText.trim())
    }
    setEditingElement(null)
    setTempText("")
  }, [editingElement, tempText, updateElementProperty])

  // Función de exportación mejorada con información del desarrollador
  const exportDesign = useCallback(
    async (format: "png" | "pdf") => {
      if (!svgRef.current) return

      const canvas = canvasRef.current!
      const ctx = canvas.getContext("2d")!
      const svgElement = svgRef.current

      // Configurar canvas con alta resolución
      const scale = 2
      canvas.width = calculations.svgWidth * scale
      canvas.height = (calculations.svgHeight + 80) * scale // Más espacio extra para info del desarrollador
      ctx.scale(scale, scale)

      // Fondo blanco
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, calculations.svgWidth, calculations.svgHeight + 80)

      // Convertir SVG a imagen
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        // Dibujar el SVG
        ctx.drawImage(img, 0, 0)

        // Agregar información del desarrollador en la parte inferior
        ctx.fillStyle = "#374151"
        ctx.font = "12px Arial, sans-serif"
        ctx.textAlign = "center"

        const bottomY = calculations.svgHeight + 20
        ctx.fillText("Desarrollo: Armando Ovalle J", calculations.svgWidth / 2, bottomY)
        ctx.fillText("WhatsApp: +57 305 289 1719", calculations.svgWidth / 2, bottomY + 15)
        ctx.fillText("GitHub: https://github.com/jacar", calculations.svgWidth / 2, bottomY + 30)
        ctx.fillText("Web: https://www.armandomi.space", calculations.svgWidth / 2, bottomY + 45)

        if (format === "png") {
          // Exportar como PNG
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `bobina-${params.diametro}mm-${Date.now()}.png`
              a.click()
              URL.revokeObjectURL(url)
            }
          })
        } else if (format === "pdf") {
          // Para PDF, crear un diseño profesional
          createProfessionalPDF()
        }

        URL.revokeObjectURL(svgUrl)
      }
      img.src = svgUrl
    },
    [calculations, params],
  )

  // Función para crear PDF profesional
  const createProfessionalPDF = useCallback(() => {
    // Simular creación de PDF profesional
    const pdfContent = `
VOICECOIL DESIGNER - ESPECIFICACIONES TÉCNICAS

PARÁMETROS DE LA BOBINA:
• Diámetro: ${params.diametro} mm
• Altura Total: ${params.alturaTotal} mm
• Altura Bobinado: ${params.alturaBobinado} mm
• Altura Tubo: ${params.alturaTubo} mm
• Espesor Tubo: ${params.espesorTubo} mm
• Material: ${materials[params.material as keyof typeof materials]?.name}
• Número de Capas: ${params.capas}
• Impedancia: ${params.impedancia}Ω

ESPECIFICACIONES CALCULADAS:
• Área de Bobinado: ${(Math.PI * params.diametro * params.alturaBobinado).toFixed(2)} mm²
• Volumen Interior: ${(Math.PI * Math.pow(params.diametro / 2 - params.espesorTubo, 2) * params.alturaTubo).toFixed(2)} mm³
• Relación Bobinado/Tubo: ${((params.alturaBobinado / params.alturaTotal) * 100).toFixed(1)}%

INFORMACIÓN DEL DESARROLLADOR:
Desarrollo: Armando Ovalle J
WhatsApp: +57 305 289 1719
Teléfono: +57 305 289 1719
GitHub: https://github.com/jacar
Web: https://www.armandomi.space
Email: info@webcincodev.com

Generado por VoiceCoil Designer
Fecha: ${new Date().toLocaleDateString()}
`

    // Crear blob de texto como simulación de PDF
    const blob = new Blob([pdfContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bobina-especificaciones-${params.diametro}mm-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)

    // En una implementación real, aquí usarías una librería como jsPDF
    console.log("PDF profesional generado (simulado)")
  }, [params, materials])

  // Renderizado de bobina pequeña para galería
  const renderMiniCoil = useCallback(
    (template: BobinaTemplate) => {
      const miniScale = 0.8
      const miniWidth = template.params.diametro * miniScale
      const miniHeight = template.params.alturaTubo * miniScale
      const miniWindingHeight = template.params.alturaBobinado * miniScale
      const miniCenterX = 40
      const miniCenterY = 30

      const material = materials[template.params.material as keyof typeof materials]

      return (
        <svg width="80" height="60" className="border rounded bg-gray-50">
          <defs>
            <linearGradient id={`mini-material-${template.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={material.color} />
              <stop offset="100%" stopColor="#CCCCCC" />
            </linearGradient>
            <linearGradient id={`mini-copper-${template.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CD7F32" />
              <stop offset="100%" stopColor="#A0522D" />
            </linearGradient>
          </defs>

          {/* Tubo exterior */}
          <rect
            x={miniCenterX - miniWidth / 2}
            y={miniCenterY - miniHeight / 2}
            width={miniWidth}
            height={miniHeight}
            fill={`url(#mini-material-${template.id})`}
            stroke="#333"
            strokeWidth="0.5"
            rx="1"
          />

          {/* Tubo interior */}
          <rect
            x={miniCenterX - (miniWidth - template.params.espesorTubo * miniScale * 2) / 2}
            y={miniCenterY - miniHeight / 2}
            width={miniWidth - template.params.espesorTubo * miniScale * 2}
            height={miniHeight}
            fill="white"
            stroke="#666"
            strokeWidth="0.3"
          />

          {/* Bobinado */}
          <rect
            x={miniCenterX - miniWidth / 2}
            y={miniCenterY - miniWindingHeight / 2}
            width={miniWidth}
            height={miniWindingHeight}
            fill={`url(#mini-copper-${template.id})`}
            opacity="0.8"
          />

          {/* Indicador de capas */}
          <text
            x={miniCenterX}
            y={miniCenterY + miniHeight / 2 + 8}
            textAnchor="middle"
            fill="#666"
            fontSize="6"
            fontWeight="bold"
          >
            {template.params.capas}L
          </text>
        </svg>
      )
    },
    [materials],
  )

  const filteredTemplates = useMemo(() => {
    return bobinaTemplates.filter((template) => {
      if (galleryFilter === "all") return true
      if (galleryFilter === "popular") return template.popular
      return template.category.toLowerCase() === galleryFilter.toLowerCase()
    })
  }, [bobinaTemplates, galleryFilter])

  const selectedElementData = useMemo(() => {
    return elements.find((el) => el.id === selectedElement)
  }, [elements, selectedElement])

  // Tema claro por defecto
  const themeClasses = "min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 overflow-x-hidden"
  const cardClasses = "border-gray-200 bg-white shadow-sm"

  return (
    <div className={themeClasses}>
      {/* Navigation Menu - Optimizado para móvil */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Logo - Clickeable para ir al inicio */}
            <div className="flex items-center cursor-pointer" onClick={scrollToTop}>
              <img src="/logo.png" alt="VoiceCoil Designer" className="h-8 md:h-10 w-auto" />
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={scrollToTop}
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center"
              >
                <Home className="w-4 h-4 mr-1" />
                Inicio
              </button>

              {/* Ayuda Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-gray-600 hover:text-gray-900 transition-colors flex items-center">
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Ayuda
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <HelpCircle className="w-5 h-5 mr-2 text-blue-500" />
                      Ayuda General
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h3 className="font-semibold text-base mb-2">¿Cómo usar VoiceCoil Designer?</h3>
                      <p className="text-gray-600 mb-4">
                        VoiceCoil Designer es una herramienta profesional para diseñar bobinas de voz para altavoces.
                        Permite configurar parámetros técnicos y obtener especificaciones exactas en tiempo real.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Herramientas Principales:</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>
                          <strong>Seleccionar:</strong> Permite seleccionar y mover elementos en el diseño
                        </li>
                        <li>
                          <strong>Mover Vista:</strong> Arrastra para cambiar la posición de la vista
                        </li>
                        <li>
                          <strong>Texto:</strong> Agrega etiquetas de texto al diseño
                        </li>
                        <li>
                          <strong>Etiqueta:</strong> Crea etiquetas rectangulares
                        </li>
                        <li>
                          <strong>Cable:</strong> Dibuja cables entre dos puntos
                        </li>
                        <li>
                          <strong>Agujero:</strong> Crea agujeros circulares (arrastrables y redimensionables)
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Configuración de Bobina:</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>
                          <strong>Diámetro:</strong> Diámetro exterior de la bobina (20-200mm)
                        </li>
                        <li>
                          <strong>Altura Total:</strong> Altura total del tubo (20-200mm)
                        </li>
                        <li>
                          <strong>Altura Bobinado:</strong> Altura de la sección bobinada
                        </li>
                        <li>
                          <strong>Espesor Tubo:</strong> Grosor de las paredes del tubo
                        </li>
                        <li>
                          <strong>Material:</strong> Material del conductor (Aluminio, Cobre, Kapton, etc.)
                        </li>
                        <li>
                          <strong>Capas:</strong> Número de capas de bobinado (1-8)
                        </li>
                        <li>
                          <strong>Impedancia:</strong> Impedancia eléctrica en ohmios (1Ω - 32Ω)
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Plantillas:</h4>
                      <p className="text-gray-600">
                        Incluye plantillas profesionales para diferentes tipos de altavoces: Drivers, Woofers,
                        Subwoofers, Tweeters y Medios. Cada plantilla incluye especificaciones técnicas completas.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Exportación:</h4>
                      <p className="text-gray-600">
                        Exporta tus diseños en formato PNG para imágenes o PDF para documentación técnica completa con
                        especificaciones e información del desarrollador.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-semibold mb-2 text-blue-800">Consejos:</h4>
                      <ul className="space-y-1 text-blue-700 text-xs">
                        <li>• Usa Ctrl+Z para deshacer y Ctrl+Y para rehacer</li>
                        <li>• Doble clic en texto para editarlo</li>
                        <li>• El bobinado dorado se puede arrastrar verticalmente</li>
                        <li>• Los agujeros se pueden mover y redimensionar</li>
                        <li>• Usa las plantillas como punto de partida</li>
                        <li>• Las medidas se muestran automáticamente</li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <a
                href="https://strongmeropower.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Tienda
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-600 hover:text-gray-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    scrollToTop()
                    setMobileMenuOpen(false)
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors px-2 py-1 flex items-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Inicio
                </button>

                <a
                  href="https://strongmeropower.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors mx-2 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tienda
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Banner - Más compacto para móvil */}
      <div
        className="relative bg-cover bg-center bg-no-repeat py-4 md:py-16 px-4 shadow-lg overflow-hidden"
        style={{ backgroundImage: "url(https://www.strongmeropower.com/wp-content/uploads/2025/07/header.png)" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col xl:flex-row items-center justify-between">
            <div className="flex-1 text-center lg:text-left mb-4 lg:mb-0">
              <h1 className="text-xl md:text-4xl lg:text-6xl font-bold tracking-tight text-white mb-2 md:mb-3">
                VoiceCoil Designer
              </h1>

              <h2 className="text-sm md:text-xl lg:text-2xl font-semibold text-orange-300 mb-2 md:mb-4">
                Constructor Profesional de Bobinas de Voz
              </h2>

              <p className="text-xs md:text-lg text-gray-200 max-w-2xl leading-relaxed mb-4 md:mb-6 hidden md:block">
                Diseña y calcula bobinas de voz personalizadas para altavoces con precisión profesional. Configura
                parámetros técnicos y obtén especificaciones exactas en tiempo real.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-sm md:text-base font-semibold shadow-lg w-full sm:w-auto"
                  onClick={() => exportDesign("png")}
                >
                  <FileImage className="w-4 h-4 mr-2" />
                  Exportar PNG
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 px-4 py-2 text-sm md:text-base backdrop-blur-sm w-full sm:w-auto"
                  onClick={() => exportDesign("pdf")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-1 md:p-4">
        {/* Toolbar Simplificado - Más compacto para móvil */}
        <div
          className={`${cardClasses} rounded-lg p-2 mb-2 md:mb-4 flex flex-wrap justify-between items-center gap-1 md:gap-2`}
        >
          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleUndo} disabled={undoStack.length === 0}>
                    <Undo2 className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Deshacer</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleRedo} disabled={redoStack.length === 0}>
                    <Redo2 className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Rehacer</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-4 md:h-6" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => zoomBobin(true)}>
                    <ZoomIn className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Acercar (+)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => zoomBobin(false)}>
                    <ZoomOut className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Alejar (-)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={resetView}>
                    <RotateCcw className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restablecer vista (R)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2 flex-wrap">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              Zoom: {Math.round(params.zoom * 100)}%
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              Elementos: {elements.length}
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
              <Layers className="w-2 h-2 md:w-3 md:h-3 mr-1" />
              {params.capas} Capas
            </Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
              {params.impedancia}Ω
            </Badge>
            {currentTool !== "pointer" && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                Herramienta: {currentTool}
              </Badge>
            )}
          </div>
        </div>

        {/* Layout Reorganizado - Herramientas a la izquierda, Canvas en el centro, Configuración a la derecha */}
        <div className="grid gap-2 md:gap-4 grid-cols-1 lg:grid-cols-5">
          {/* Panel de Herramientas - Lado Izquierdo */}
          <div className="lg:col-span-1">
            <Card className={cardClasses}>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-base md:text-lg flex items-center">
                  <Pencil className="w-3 h-3 md:w-4 md:w-4 mr-2 text-blue-500" />
                  Herramientas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {/* Herramientas principales - Grid vertical (sin medidas) */}
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant={currentTool === "pointer" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentTool("pointer")}
                    className={`text-xs justify-start ${currentTool === "pointer" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  >
                    <MousePointer className="w-3 h-3 mr-2" />
                    Seleccionar
                  </Button>

                  <Button
                    variant={currentTool === "hand" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentTool("hand")}
                    className={`text-xs justify-start ${currentTool === "hand" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                  >
                    <Hand className="w-3 h-3 mr-2" />
                    Mover Vista
                  </Button>

                  <Button
                    variant={currentTool === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentTool("text")}
                    className={`text-xs justify-start ${currentTool === "text" ? "bg-green-600 hover:bg-green-700" : ""}`}
                  >
                    <Type className="w-3 h-3 mr-2" />
                    Texto
                  </Button>

                  <Button
                    variant={currentTool === "label" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentTool("label")}
                    className={`text-xs justify-start ${currentTool === "label" ? "bg-green-600 hover:bg-green-700" : ""}`}
                  >
                    <Square className="w-3 h-3 mr-2" />
                    Etiqueta
                  </Button>

                  <Button
                    variant={currentTool === "cable" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentTool("cable")}
                    className={`text-xs justify-start ${currentTool === "cable" ? "bg-orange-600 hover:bg-orange-700" : ""}`}
                  >
                    <Cable className="w-3 h-3 mr-2" />
                    Cable
                  </Button>

                  <Button
                    variant={currentTool === "hole" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentTool("hole")}
                    className={`text-xs justify-start ${currentTool === "hole" ? "bg-gray-600 hover:bg-gray-700" : ""}`}
                  >
                    <Circle className="w-3 h-3 mr-2" />
                    Agujero
                  </Button>
                </div>

                {/* Controles de vista - Movido aquí debajo de herramientas */}
                <div className="space-y-2 md:space-y-3">
                  <Label className="text-xs md:text-sm font-medium">Controles de Vista</Label>

                  <div className="grid grid-cols-3 gap-1">
                    <div></div>
                    <Button variant="outline" size="sm" onClick={() => moveBobin("up")} className="text-xs">
                      <ChevronUp className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <div></div>
                    <Button variant="outline" size="sm" onClick={() => moveBobin("left")} className="text-xs">
                      <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetView} className="text-xs bg-transparent">
                      <RotateCcw className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => moveBobin("right")} className="text-xs">
                      <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <div></div>
                    <Button variant="outline" size="sm" onClick={() => moveBobin("down")} className="text-xs">
                      <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <div></div>
                  </div>
                </div>

                <Separator />

                {/* Instrucciones mejoradas */}
                <div className="bg-blue-50 p-2 md:p-3 rounded-lg text-xs md:text-sm border border-blue-200">
                  <div className="font-medium text-blue-800 mb-1">Cómo usar:</div>
                  <div className="text-blue-700">
                    {currentTool === "pointer" &&
                      "Clic para seleccionar elementos. Arrastra el bobinado dorado, agujeros. Doble clic para editar texto."}
                    {currentTool === "hand" && "Arrastra para mover la vista de la bobina."}
                    {currentTool === "text" &&
                      "Clic donde quieras agregar texto. Se abrirá automáticamente para editar."}
                    {currentTool === "label" && "Arrastra para crear una etiqueta rectangular. Doble clic para editar."}
                    {currentTool === "cable" && "Arrastra para dibujar un cable entre dos puntos."}
                    {currentTool === "hole" &&
                      "Arrastra desde el centro para crear un agujero circular redimensionable y movible."}
                  </div>
                </div>

                <Separator />

                {/* Configuraciones rápidas */}
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs md:text-sm">Mostrar cuadrícula</Label>
                    <Switch
                      checked={settings.showGrid}
                      onCheckedChange={(checked) => updateSettings("showGrid", checked)}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs md:text-sm">Mostrar medidas</Label>
                    <Switch
                      checked={settings.showMeasurements}
                      onCheckedChange={(checked) => updateSettings("showMeasurements", checked)}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>

                <Separator />

                {/* Acciones rápidas */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deleteAllElements}
                    disabled={elements.length === 0}
                    className="w-full bg-transparent hover:bg-red-50 hover:text-red-600 text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Limpiar todo ({elements.length})
                  </Button>
                </div>

                {/* Lista de elementos mejorada */}
                {elements.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm font-medium">Elementos:</Label>
                    <div className="space-y-1 max-h-32 md:max-h-40 overflow-y-auto">
                      {elements.map((element) => (
                        <div
                          key={element.id}
                          className={`flex items-center justify-between text-xs p-2 rounded cursor-pointer transition-colors ${
                            selectedElement === element.id
                              ? "bg-blue-100 border border-blue-300"
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}
                          onClick={() => setSelectedElement(element.id)}
                        >
                          <div className="flex items-center gap-2">
                            {element.type === "label" && <Square className="w-3 h-3 text-green-500" />}
                            {element.type === "text" && <Type className="w-3 h-3 text-blue-500" />}
                            {element.type === "cable" && <Cable className="w-3 h-3 text-orange-500" />}
                            {element.type === "hole" && <Circle className="w-3 h-3 text-gray-500" />}
                            <span className="truncate max-w-16">{element.text}</span>
                            {editingElement === element.id && <Edit3 className="w-3 h-3 text-blue-500" />}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteElement(element.id)
                            }}
                            className="h-5 w-5 p-0 hover:bg-red-100"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Canvas de la Bobina - Centro */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Contenedor SVG - Responsive y centrado */}
              <div className="flex justify-center items-center w-full p-2">
                <div className="relative">
                  <svg
                    width={calculations.svgWidth}
                    height={calculations.svgHeight}
                    ref={svgRef}
                    style={{ backgroundColor: "#f9f9f9" }}
                    onMouseDown={handleSvgMouseDown}
                    onMouseMove={handleSvgMouseMove}
                    onMouseUp={handleSvgMouseUp}
                    onDoubleClick={handleSvgDoubleClick}
                    className="border border-gray-200 rounded-lg"
                  >
                    <defs>
                      <linearGradient id="materialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={materials[params.material as keyof typeof materials]?.color} />
                        <stop offset="100%" stopColor="#CCCCCC" />
                      </linearGradient>
                      <linearGradient id="copperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#CD7F32" />
                        <stop offset="100%" stopColor="#A0522D" />
                      </linearGradient>

                      <marker id="arrowhead-black" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#333" />
                      </marker>

                      <marker id="arrowhead-black-v" markerWidth="6" markerHeight="8" refX="3" refY="7" orient="auto">
                        <polygon points="0 0, 6 0, 3 8" fill="#333" />
                      </marker>
                    </defs>

                    {/* Cuadrícula mejorada */}
                    {settings.showGrid && (
                      <>
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d1d5db" strokeWidth="1" />
                          </pattern>
                        </defs>
                        <rect
                          width={calculations.svgWidth}
                          height={calculations.svgHeight}
                          fill="url(#grid)"
                          style={{ pointerEvents: "none" }}
                        />
                      </>
                    )}

                    {/* Tubo exterior */}
                    <rect
                      x={calculations.centerX - calculations.bobinaWidth / 2}
                      y={calculations.centerY - calculations.bobinaHeight / 2}
                      width={calculations.bobinaWidth}
                      height={calculations.bobinaHeight}
                      fill="url(#materialGradient)"
                      stroke="#333"
                      strokeWidth="1"
                      rx="3"
                      transform={`rotate(${params.rotation} ${calculations.centerX} ${calculations.centerY})`}
                    />

                    {/* Tubo interior */}
                    <rect
                      x={
                        calculations.centerX -
                        (calculations.bobinaWidth - params.espesorTubo * calculations.scale * 2) / 2
                      }
                      y={calculations.centerY - calculations.bobinaHeight / 2}
                      width={calculations.bobinaWidth - params.espesorTubo * calculations.scale * 2}
                      height={calculations.bobinaHeight}
                      fill="white"
                      stroke="#666"
                      strokeWidth="0.5"
                      transform={`rotate(${params.rotation} ${calculations.centerX} ${calculations.centerY})`}
                    />

                    {/* Bobinado con alambre realista */}
                    <g transform={`rotate(${params.rotation} ${calculations.centerX} ${calculations.centerY})`}>
                      {/* Fondo del bobinado */}
                      <rect
                        x={calculations.centerX - calculations.bobinaWidth / 2}
                        y={
                          calculations.centerY -
                          calculations.bobinadoHeight / 2 +
                          params.windingPositionY * calculations.scale
                        }
                        width={calculations.bobinaWidth}
                        height={calculations.bobinadoHeight}
                        fill="url(#copperGradient)"
                        opacity="0.3"
                        style={{ cursor: "grab" }}
                      />

                      {/* Líneas de alambre realistas */}
                      {Array.from({ length: params.capas }, (_, layerIndex) => {
                        const layerOffset = layerIndex * 2 - (params.capas - 1)
                        const wireSpacing = Math.max(
                          1,
                          calculations.bobinadoHeight / Math.max(20, params.alturaBobinado / 2),
                        )
                        const wiresPerLayer = Math.floor(calculations.bobinadoHeight / wireSpacing)

                        return Array.from({ length: wiresPerLayer }, (_, wireIndex) => {
                          const wireY =
                            calculations.centerY -
                            calculations.bobinadoHeight / 2 +
                            params.windingPositionY * calculations.scale +
                            wireIndex * wireSpacing
                          const wireOpacity = 0.7 + layerIndex * 0.1
                          const wireColor = layerIndex % 2 === 0 ? "#CD7F32" : "#B8860B"

                          return (
                            <line
                              key={`layer-${layerIndex}-wire-${wireIndex}`}
                              x1={calculations.centerX - calculations.bobinaWidth / 2 + layerOffset}
                              y1={wireY}
                              x2={calculations.centerX + calculations.bobinaWidth / 2 + layerOffset}
                              y2={wireY}
                              stroke={wireColor}
                              strokeWidth={Math.max(0.5, calculations.scale * 0.3)}
                              opacity={wireOpacity}
                              style={{ pointerEvents: "none" }}
                            />
                          )
                        })
                      })}

                      {/* Efecto de brillo en el alambre */}
                      {Array.from({ length: Math.min(5, params.capas) }, (_, index) => (
                        <line
                          key={`highlight-${index}`}
                          x1={calculations.centerX - calculations.bobinaWidth / 2}
                          y1={
                            calculations.centerY -
                            calculations.bobinadoHeight / 2 +
                            params.windingPositionY * calculations.scale +
                            index * 4
                          }
                          x2={calculations.centerX + calculations.bobinaWidth / 2}
                          y2={
                            calculations.centerY -
                            calculations.bobinadoHeight / 2 +
                            params.windingPositionY * calculations.scale +
                            index * 4
                          }
                          stroke="#FFD700"
                          strokeWidth="0.5"
                          opacity="0.6"
                          style={{ pointerEvents: "none" }}
                        />
                      ))}
                    </g>

                    {/* Elementos interactivos */}
                    {elements.map((element) => {
                      switch (element.type) {
                        case "label":
                          return (
                            <foreignObject
                              key={element.id}
                              x={element.x}
                              y={element.y}
                              width={element.width || 100}
                              height={element.height || 30}
                            >
                              <div
                                style={{
                                  backgroundColor: element.backgroundColor || "#FFFFFF",
                                  color: element.color || "#000000",
                                  fontSize: element.fontSize || 12,
                                  padding: "5px",
                                  border: selectedElement === element.id ? "1px solid blue" : "none",
                                  borderRadius: "3px",
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  textAlign: "center",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {element.text}
                              </div>
                            </foreignObject>
                          )

                        case "text":
                          return (
                            <text
                              key={element.id}
                              x={element.x}
                              y={element.y}
                              fontSize={element.fontSize || 14}
                              fill={element.color || "#000000"}
                              style={{
                                userSelect: "none",
                                cursor: "pointer",
                              }}
                            >
                              {element.text}
                            </text>
                          )

                        case "cable":
                          return (
                            <g key={element.id}>
                              <line
                                x1={element.x}
                                y1={element.y}
                                x2={element.lineEndX || element.x}
                                y2={element.lineEndY || element.y}
                                stroke={element.color || "#8B4513"}
                                strokeWidth={3}
                                style={{ pointerEvents: "stroke" }}
                              />
                              <text
                                x={(element.x + (element.lineEndX || element.x)) / 2}
                                y={(element.y + (element.lineEndY || element.y)) / 2 - 5}
                                fontSize={10}
                                fill={element.color || "#8B4513"}
                                textAnchor="middle"
                                style={{ pointerEvents: "none" }}
                              >
                                {element.text}
                              </text>
                            </g>
                          )

                        case "hole":
                          return (
                            <g key={element.id}>
                              <ellipse
                                cx={element.x + (element.width || 20) / 2}
                                cy={element.y + (element.height || 20) / 2}
                                rx={(element.width || 20) / 2}
                                ry={(element.height || 20) / 2}
                                fill="none"
                                stroke={element.color || "#333333"}
                                strokeWidth="2"
                                style={{ cursor: selectedElement === element.id ? "move" : "pointer" }}
                              />
                              {/* Handle de redimensionamiento para agujeros seleccionados */}
                              {selectedElement === element.id && (
                                <>
                                  {/* Handle de redimensionamiento */}
                                  <circle
                                    cx={element.x + (element.width || 20)}
                                    cy={element.y + (element.height || 20) / 2}
                                    r="6"
                                    fill="#4F46E5"
                                    stroke="white"
                                    strokeWidth="2"
                                    style={{ cursor: "ew-resize" }}
                                  />
                                  {/* Línea guía para mostrar el radio */}
                                  <line
                                    x1={element.x + (element.width || 20) / 2}
                                    y1={element.y + (element.height || 20) / 2}
                                    x2={element.x + (element.width || 20)}
                                    y2={element.y + (element.height || 20) / 2}
                                    stroke="#4F46E5"
                                    strokeWidth="1"
                                    strokeDasharray="2,2"
                                    style={{ pointerEvents: "none" }}
                                  />
                                </>
                              )}
                            </g>
                          )

                        default:
                          return null
                      }
                    })}

                    {/* Medidas automáticas y etiquetas profesionales - Mejoradas con mejor espaciado */}
                    {settings.showMeasurements && (
                      <g>
                        {/* Etiqueta "Ω Ohmio" en la esquina superior derecha del canvas */}
                        <g>
                          <rect
                            x={calculations.svgWidth - 120}
                            y={10}
                            width="110"
                            height="35"
                            fill="rgba(255, 255, 255, 0.95)"
                            stroke="#333"
                            strokeWidth="1"
                            rx="5"
                            style={{ pointerEvents: "none" }}
                          />
                          <text
                            x={calculations.svgWidth - 65}
                            y={32}
                            textAnchor="middle"
                            fontSize="16"
                            fontWeight="bold"
                            fill="#333"
                            style={{ pointerEvents: "none" }}
                          >
                            Ω {params.impedancia} Ohmios
                          </text>
                        </g>

                        {/* Etiqueta "Diámetro" con flecha horizontal - Mejor espaciado */}
                        <g>
                          {/* Texto "Diámetro" */}
                          <text
                            x={calculations.centerX}
                            y={calculations.centerY - calculations.bobinaHeight / 2 - 60}
                            textAnchor="middle"
                            fontSize="16"
                            fontWeight="bold"
                            fill="#333"
                            style={{ pointerEvents: "none" }}
                          >
                            Diámetro
                          </text>

                          {/* Línea horizontal con flechas */}
                          <line
                            x1={calculations.centerX - calculations.bobinaWidth / 2 - 20}
                            y1={calculations.centerY - calculations.bobinaHeight / 2 - 35}
                            x2={calculations.centerX + calculations.bobinaWidth / 2 + 20}
                            y2={calculations.centerY - calculations.bobinaHeight / 2 - 35}
                            stroke="#333"
                            strokeWidth="2"
                            markerStart="url(#arrowhead-black)"
                            markerEnd="url(#arrowhead-black)"
                            style={{ pointerEvents: "none" }}
                          />

                          {/* Valor del diámetro con mejor espaciado */}
                          <rect
                            x={calculations.centerX - 30}
                            y={calculations.centerY - calculations.bobinaHeight / 2 - 50}
                            width="60"
                            height="25"
                            fill="white"
                            stroke="#333"
                            strokeWidth="1"
                            rx="3"
                            style={{ pointerEvents: "none" }}
                          />
                          <text
                            x={calculations.centerX}
                            y={calculations.centerY - calculations.bobinaHeight / 2 - 32}
                            textAnchor="middle"
                            fill="#333"
                            fontSize="14"
                            fontWeight="bold"
                            style={{ pointerEvents: "none" }}
                          >
                            {params.diametro}mm
                          </text>
                        </g>

                        {/* Etiqueta "Material" con flecha - Mejor espaciado */}
                        <g>
                          <text
                            x={calculations.centerX + calculations.bobinaWidth / 2 + 80}
                            y={calculations.centerY - 40}
                            fontSize="16"
                            fontWeight="bold"
                            fill="#333"
                            style={{ pointerEvents: "none" }}
                          >
                            Material
                          </text>

                          {/* Línea que apunta al material */}
                          <line
                            x1={calculations.centerX + calculations.bobinaWidth / 2 + 10}
                            y1={calculations.centerY - 10}
                            x2={calculations.centerX + calculations.bobinaWidth / 2 + 70}
                            y2={calculations.centerY - 25}
                            stroke="#333"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead-black)"
                            style={{ pointerEvents: "none" }}
                          />

                          {/* Valor del material con mejor espaciado */}
                          <text
                            x={calculations.centerX + calculations.bobinaWidth / 2 + 80}
                            y={calculations.centerY - 15}
                            fontSize="12"
                            fill="#666"
                            style={{ pointerEvents: "none" }}
                          >
                            {materials[params.material as keyof typeof materials]?.name}
                          </text>
                        </g>

                        {/* Etiqueta "Devanado" más separada de las flechas */}
                        <g>
                          <text
                            x={calculations.centerX - calculations.bobinaWidth / 2 - 120}
                            y={calculations.centerY + params.windingPositionY * calculations.scale - 40}
                            fontSize="16"
                            fontWeight="bold"
                            fill="#333"
                            style={{ pointerEvents: "none" }}
                          >
                            Devanado
                          </text>

                          {/* Línea vertical con flechas para el devanado - Más pegada a la bobina */}
                          <line
                            x1={calculations.centerX - calculations.bobinaWidth / 2 - 30}
                            y1={
                              calculations.centerY -
                              calculations.bobinadoHeight / 2 +
                              params.windingPositionY * calculations.scale -
                              15
                            }
                            x2={calculations.centerX - calculations.bobinaWidth / 2 - 30}
                            y2={
                              calculations.centerY +
                              calculations.bobinadoHeight / 2 +
                              params.windingPositionY * calculations.scale +
                              15
                            }
                            stroke="#333"
                            strokeWidth="2"
                            markerStart="url(#arrowhead-black-v)"
                            markerEnd="url(#arrowhead-black-v)"
                            style={{ pointerEvents: "none" }}
                          />

                          {/* Valor del devanado con mejor espaciado */}
                          <rect
                            x={calculations.centerX - calculations.bobinaWidth / 2 - 75}
                            y={calculations.centerY + params.windingPositionY * calculations.scale - 15}
                            width="60"
                            height="25"
                            fill="white"
                            stroke="#333"
                            strokeWidth="1"
                            rx="3"
                            style={{ pointerEvents: "none" }}
                          />
                          <text
                            x={calculations.centerX - calculations.bobinaWidth / 2 - 45}
                            y={calculations.centerY + params.windingPositionY * calculations.scale + 2}
                            textAnchor="middle"
                            fill="#333"
                            fontSize="14"
                            fontWeight="bold"
                            style={{ pointerEvents: "none" }}
                          >
                            {params.alturaBobinado}mm
                          </text>
                        </g>

                        {/* Líneas de referencia punteadas para delimitar el bobinado */}
                        <rect
                          x={calculations.centerX - calculations.bobinaWidth / 2}
                          y={
                            calculations.centerY -
                            calculations.bobinadoHeight / 2 +
                            params.windingPositionY * calculations.scale
                          }
                          width={calculations.bobinaWidth}
                          height={calculations.bobinadoHeight}
                          fill="none"
                          stroke="#666"
                          strokeWidth="1"
                          strokeDasharray="3,3"
                          style={{ pointerEvents: "none" }}
                        />

                        {/* Información adicional en la parte inferior - Sin fondo blanco */}
                        {!calculations.isMobile && (
                          <g>
                            <text
                              x={calculations.centerX}
                              y={calculations.centerY + calculations.bobinaHeight / 2 + 80}
                              textAnchor="middle"
                              fill="#333"
                              fontSize="16"
                              fontWeight="bold"
                              style={{ pointerEvents: "none" }}
                            >
                              Especificaciones Técnicas
                            </text>

                            <text
                              x={calculations.centerX - 150}
                              y={calculations.centerY + calculations.bobinaHeight / 2 + 105}
                              fill="#666"
                              fontSize="12"
                              style={{ pointerEvents: "none" }}
                            >
                              Diámetro: {params.diametro}mm | Altura: {params.alturaTubo}mm | Impedancia:{" "}
                              {params.impedancia}Ω
                            </text>

                            <text
                              x={calculations.centerX - 150}
                              y={calculations.centerY + calculations.bobinaHeight / 2 + 125}
                              fill="#666"
                              fontSize="12"
                              style={{ pointerEvents: "none" }}
                            >
                              Material: {materials[params.material as keyof typeof materials]?.name} | Capas:{" "}
                              {params.capas}
                            </text>

                            <text
                              x={calculations.centerX - 150}
                              y={calculations.centerY + calculations.bobinaHeight / 2 + 145}
                              fill="#666"
                              fontSize="12"
                              style={{ pointerEvents: "none" }}
                            >
                              Devanado: {params.alturaBobinado}mm | Espesor: {params.espesorTubo}mm
                            </text>
                          </g>
                        )}
                      </g>
                    )}
                  </svg>
                </div>
              </div>
              <canvas ref={canvasRef} style={{ display: "none" }} />

              {/* Botones de descarga debajo de Especificaciones Técnicas */}
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Diseño
                </h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => exportDesign("png")}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                    size="sm"
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    Descargar PNG
                  </Button>
                  <Button
                    onClick={() => exportDesign("pdf")}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 flex-1"
                    size="sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </Button>
                </div>
              </div>

              {/* Instrucciones de uso debajo del canvas */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">📋 Instrucciones de Uso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                  <div>
                    <h4 className="font-medium mb-2">🎯 Herramientas Básicas:</h4>
                    <ul className="space-y-1 text-xs leading-relaxed">
                      <li>
                        • <strong>Seleccionar:</strong> Clic para seleccionar elementos
                      </li>
                      <li>
                        • <strong>Mover Vista:</strong> Arrastra para mover la vista
                      </li>
                      <li>
                        • <strong>Texto:</strong> Clic para agregar texto
                      </li>
                      <li>
                        • <strong>Agujero:</strong> Arrastra para crear agujeros manipulables
                      </li>
                      <li>
                        • <strong>Cable:</strong> Dibuja cables entre dos puntos
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">⚡ Atajos de Teclado:</h4>
                    <ul className="space-y-1 text-xs leading-relaxed">
                      <li>
                        • <strong>Ctrl+Z:</strong> Deshacer
                      </li>
                      <li>
                        • <strong>Ctrl+Y:</strong> Rehacer
                      </li>
                      <li>
                        • <strong>Doble clic:</strong> Editar texto
                      </li>
                      <li>
                        • <strong>Supr:</strong> Eliminar elemento seleccionado
                      </li>
                      <li>
                        • <strong>Arrastrar:</strong> Mover agujeros
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de Configuración y Plantillas - Lado Derecho */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="design" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="design" className="data-[state=active]:bg-white text-xs md:text-sm">
                  <Settings className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Bobina
                </TabsTrigger>
                <TabsTrigger value="gallery" className="data-[state=active]:bg-white text-xs md:text-sm">
                  <Grid3X3 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Plantillas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="design">
                <Card className={cardClasses}>
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="text-base md:text-lg flex items-center">
                      <Settings className="w-3 h-3 md:w-4 md:h-4 mr-2 text-red-500" />
                      Configuración de Bobina
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    {/* Controles de dimensiones mejorados - Responsive */}
                    <div className="space-y-3 md:space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs md:text-sm">Diámetro</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={params.diametro}
                              onChange={(e) => updateParam("diametro", Number(e.target.value))}
                              className="w-12 md:w-16 h-6 md:h-8 text-xs"
                              min="20"
                              max="200"
                            />
                            <span className="text-xs text-gray-500">mm</span>
                          </div>
                        </div>
                        <Slider
                          value={[params.diametro]}
                          onValueChange={(value) => updateParam("diametro", value[0])}
                          max={200}
                          min={20}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs md:text-sm">Altura Total</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={params.alturaTotal}
                              onChange={(e) => updateParam("alturaTotal", Number(e.target.value))}
                              className="w-12 md:w-16 h-6 md:h-8 text-xs"
                              min="20"
                              max="200"
                            />
                            <span className="text-xs text-gray-500">mm</span>
                          </div>
                        </div>
                        <Slider
                          value={[params.alturaTotal]}
                          onValueChange={(value) => updateParam("alturaTotal", value[0])}
                          max={200}
                          min={20}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs md:text-sm">Altura Bobinado</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={params.alturaBobinado}
                              onChange={(e) => updateParam("alturaBobinado", Number(e.target.value))}
                              className="w-12 md:w-16 h-6 md:h-8 text-xs"
                              min="10"
                              max={params.alturaTotal}
                            />
                            <span className="text-xs text-gray-500">mm</span>
                          </div>
                        </div>
                        <Slider
                          value={[params.alturaBobinado]}
                          onValueChange={(value) => updateParam("alturaBobinado", value[0])}
                          max={params.alturaTotal}
                          min={10}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs md:text-sm">Altura Tubo</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={params.alturaTubo}
                              onChange={(e) => updateParam("alturaTubo", Number(e.target.value))}
                              className="w-12 md:w-16 h-6 md:h-8 text-xs"
                              min="10"
                              max="200"
                            />
                            <span className="text-xs text-gray-500">mm</span>
                          </div>
                        </div>
                        <Slider
                          value={[params.alturaTubo]}
                          onValueChange={(value) => updateParam("alturaTubo", value[0])}
                          max={200}
                          min={10}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs md:text-sm">Espesor Tubo</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={params.espesorTubo}
                              onChange={(e) => updateParam("espesorTubo", Number(e.target.value))}
                              className="w-12 md:w-16 h-6 md:h-8 text-xs"
                              min="1"
                              max="15"
                              step="0.5"
                            />
                            <span className="text-xs text-gray-500">mm</span>
                          </div>
                        </div>
                        <Slider
                          value={[params.espesorTubo]}
                          onValueChange={(value) => updateParam("espesorTubo", value[0])}
                          max={15}
                          min={1}
                          step={0.5}
                          className="w-full"
                        />
                      </div>

                      {/* Control de capas - Responsive */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs md:text-sm flex items-center">
                            <Layers className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            Capas
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={params.capas}
                              onChange={(e) => updateParam("capas", Number(e.target.value))}
                              className="w-12 md:w-16 h-6 md:h-8 text-xs"
                              min="1"
                              max="8"
                            />
                            <span className="text-xs text-gray-500">capas</span>
                          </div>
                        </div>
                        <Slider
                          value={[params.capas]}
                          onValueChange={(value) => updateParam("capas", value[0])}
                          max={8}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Control de impedancia - Nuevo */}
                      <div className="space-y-2">
                        <Label className="text-xs md:text-sm">Impedancia (Ohmios)</Label>
                        <Select
                          value={params.impedancia.toString()}
                          onValueChange={(value) => updateParam("impedancia", Number(value))}
                        >
                          <SelectTrigger className="text-xs md:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {impedanciaOptions.map((ohm) => (
                              <SelectItem key={ohm} value={ohm.toString()}>
                                {ohm}Ω
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          Impedancia nominal: {params.impedancia}Ω
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Material - Responsive */}
                    <div className="space-y-2">
                      <Label className="text-xs md:text-sm">Material</Label>
                      <Select value={params.material} onValueChange={(value) => updateParam("material", value)}>
                        <SelectTrigger className="text-xs md:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(materials).map(([key, material]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full border"
                                  style={{ backgroundColor: material.color }}
                                />
                                {material.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        {materials[params.material as keyof typeof materials]?.properties}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gallery">
                <Card className={cardClasses}>
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="text-base md:text-lg flex items-center">
                      <Grid3X3 className="w-3 h-3 md:w-4 md:h-4 mr-2 text-green-500" />
                      Galería de Plantillas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    {/* Filtro de galería - Responsive */}
                    <div className="space-y-2">
                      <Label className="text-xs md:text-sm">Filtrar por categoría</Label>
                      <Select value={galleryFilter} onValueChange={setGalleryFilter}>
                        <SelectTrigger className="text-xs md:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          <SelectItem value="popular">Populares</SelectItem>
                          <SelectItem value="driver">Drivers</SelectItem>
                          <SelectItem value="woofer">Woofers</SelectItem>
                          <SelectItem value="subwoofer">Subwoofers</SelectItem>
                          <SelectItem value="tweeter">Tweeters</SelectItem>
                          <SelectItem value="midrange">Medios</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Plantillas mejoradas con mejor usabilidad y textos ajustados */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                            selectedTemplate === template.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => loadTemplate(template)}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Miniatura de la bobina */}
                            <div className="flex-shrink-0">{renderMiniCoil(template)}</div>

                            {/* Información de la plantilla con textos ajustados */}
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <div className="flex flex-col space-y-1 mb-2">
                                <h4 className="text-sm font-semibold text-gray-900 truncate">{template.name}</h4>
                                <div className="flex flex-wrap gap-1">
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      template.category === "Driver"
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : template.category === "Woofer"
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : template.category === "Subwoofer"
                                            ? "bg-red-50 text-red-700 border-red-200"
                                            : template.category === "Tweeter"
                                              ? "bg-purple-50 text-purple-700 border-purple-200"
                                              : "bg-orange-50 text-orange-700 border-orange-200"
                                    }`}
                                  >
                                    {template.category}
                                  </Badge>
                                  {template.popular && (
                                    <Badge
                                      variant="outline"
                                      className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                                    >
                                      Popular
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed break-words">
                                {template.description}
                              </p>

                              {/* Especificaciones clave con mejor espaciado y ajuste de texto */}
                              <div className="grid grid-cols-1 gap-1 text-xs">
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-gray-500 text-xs">Diámetro:</span>
                                  <span className="font-medium text-xs">{template.params.diametro}mm</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-gray-500 text-xs">Potencia:</span>
                                  <span className="font-medium text-xs truncate ml-2">{template.specs.power}</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-gray-500 text-xs">Impedancia:</span>
                                  <span className="font-medium text-xs">{template.params.impedancia}Ω</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-gray-500 text-xs">Capas:</span>
                                  <span className="font-medium text-xs">{template.params.capas}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Footer Completo - Movido fuera del contenedor del canvas */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo y descripción */}
            <div className="md:col-span-1">
              <div className="flex items-center mb-4">
                <img src="/webcinco-logo.svg" alt="VoiceCoil Designer" className="h-10 w-auto mr-3" />
                <span className="text-xl font-bold">VoiceCoil Designer</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Herramienta profesional para el diseño y cálculo de bobinas de voz para altavoces. Desarrollado con
                precisión técnica para ingenieros de audio.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/jacar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  {/* Icono original de GitHub */}
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.armandomi.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  {/* Icono original de Globe/Web */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Enlaces útiles */}
            <div className="md:col-span-1">
              <h4 className="text-lg font-semibold mb-4">Enlaces Útiles</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-gray-400 hover:text-white">Preguntas Frecuentes</button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Preguntas Frecuentes</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 text-sm">
                        <div>
                          <h4 className="font-semibold mb-2">¿Qué es VoiceCoil Designer?</h4>
                          <p className="text-gray-600">
                            Es una herramienta profesional para diseñar y calcular bobinas de voz para altavoces con
                            precisión técnica.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">¿Es gratuito?</h4>
                          <p className="text-gray-600">
                            Sí, VoiceCoil Designer es completamente gratuito para uso personal y comercial.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">¿Puedo exportar mis diseños?</h4>
                          <p className="text-gray-600">
                            Sí, puedes exportar en formato PNG para imágenes y PDF para documentación técnica.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">¿Incluye plantillas predefinidas?</h4>
                          <p className="text-gray-600">
                            Sí, incluye plantillas para drivers, woofers, subwoofers, tweeters y medios con
                            especificaciones técnicas completas.
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </li>
                <li>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-gray-400 hover:text-white">Soporte Técnico</button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Soporte Técnico</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 text-sm">
                        <p>Para soporte técnico, puedes contactarnos a través de:</p>
                        <div className="space-y-2">
                          <p>
                            <strong>WhatsApp:</strong>
                            <a href="https://wa.me/573052891719" className="text-blue-600 hover:underline">
                              +57 305 289 1719
                            </a>
                          </p>
                          <p>
                            <strong>Email:</strong>
                            <a href="mailto:ovalle_938@hotmail.com" className="text-blue-600 hover:underline">
                              ovalle_938@hotmail.com
                            </a>
                          </p>
                          <p>
                            <strong>GitHub:</strong>
                            <a
                              href="https://github.com/jacar"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              https://github.com/jacar
                            </a>
                          </p>
                        </div>
                        <p className="text-gray-600">
                          Horario de atención: Lunes a Viernes de 8:00 AM a 6:00 PM (GMT-5)
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </li>
                <li>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-gray-400 hover:text-white">Términos de Servicio</button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Términos de Servicio</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 text-sm">
                        <div>
                          <h4 className="font-semibold mb-2">1. Aceptación de Términos</h4>
                          <p className="text-gray-600">
                            Al usar VoiceCoil Designer, aceptas estos términos de servicio en su totalidad.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">2. Uso Permitido</h4>
                          <p className="text-gray-600">
                            Puedes usar la herramienta para fines personales y comerciales. No está permitido
                            redistribuir o vender el software.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">3. Limitación de Responsabilidad</h4>
                          <p className="text-gray-600">
                            El software se proporciona "tal como está" sin garantías. El desarrollador no se hace
                            responsable por daños derivados del uso.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">4. Propiedad Intelectual</h4>
                          <p className="text-gray-600">
                            VoiceCoil Designer es propiedad de Armando Ovalle J. Todos los derechos reservados.
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </li>
                <li>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-gray-400 hover:text-white">Política de Privacidad</button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Política de Privacidad</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 text-sm">
                        <div>
                          <h4 className="font-semibold mb-2">1. Información que Recopilamos</h4>
                          <p className="text-gray-600">
                            VoiceCoil Designer funciona completamente en tu navegador. No recopilamos ni almacenamos
                            datos personales en nuestros servidores.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">2. Almacenamiento Local</h4>
                          <p className="text-gray-600">
                            Tus diseños y configuraciones se guardan localmente en tu navegador usando localStorage.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">3. Cookies</h4>
                          <p className="text-gray-600">
                            No utilizamos cookies de seguimiento. Solo cookies técnicas necesarias para el
                            funcionamiento.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">4. Contacto</h4>
                          <p className="text-gray-600">
                            Si tienes preguntas sobre esta política, contacta: ovalle_938@hotmail.com
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </li>
              </ul>
            </div>

            {/* Contacto */}
            <div className="md:col-span-1">
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <p className="text-gray-400 text-sm mb-2">Armando Ovalle J</p>
              <p className="text-gray-400 text-sm mb-2">
                WhatsApp:
                <a href="https://wa.me/573052891719" className="hover:text-white">
                  +57 305 289 1719
                </a>
              </p>
              <p className="text-gray-400 text-sm mb-2">
                Email:
                <a href="mailto:ovalle_938@hotmail.com" className="hover:text-white">
                  ovalle_938@hotmail.com
                </a>
              </p>
              <p className="text-gray-400 text-sm">Medellín, Colombia</p>
            </div>

            {/* Newsletter */}
            <div className="md:col-span-1">
              <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-400 text-sm mb-4">
                Suscríbete para recibir las últimas noticias y actualizaciones.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col space-y-2">
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === "sending"}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
                >
                  {newsletterStatus === "sending" ? "Enviando..." : "Suscribirse"}
                </button>
              </form>
              {newsletterStatus === "success" && (
                <p className="text-green-400 text-xs mt-2">¡Suscripción enviada correctamente!</p>
              )}
              {newsletterStatus === "error" && (
                <p className="text-red-400 text-xs mt-2">Error al enviar. Inténtalo de nuevo.</p>
              )}
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 mt-8">
            <p className="text-gray-500 text-center text-sm">
              © {new Date().getFullYear()} VoiceCoil Designer. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
