"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import {
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Calculator,
  BarChart3,
  PieChart,
  LineChart,
  Hash,
} from "lucide-react"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface CalculatorResponse {
  windowPrevState: number[]
  windowCurrState: number[]
  numbers: number[]
  avg: number
}

const numberTypes = [
  { id: "p", name: "Prime", icon: <Hash className="w-5 h-5" />, color: "from-rose-500 to-pink-600" },
  { id: "f", name: "Fibonacci", icon: <LineChart className="w-5 h-5" />, color: "from-amber-500 to-orange-600" },
  { id: "e", name: "Even", icon: <BarChart3 className="w-5 h-5" />, color: "from-emerald-500 to-teal-600" },
  { id: "r", name: "Random", icon: <PieChart className="w-5 h-5" />, color: "from-blue-500 to-indigo-600" },
]

export default function Home() {
  const [numberType, setNumberType] = useState<string>("p")
  const [windowSize, setWindowSize] = useState<number>(10)
  const [loading, setLoading] = useState<boolean>(false)
  const [response, setResponse] = useState<CalculatorResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("current")
  const [animateNumber, setAnimateNumber] = useState(false)

  // Get the current number type object
  const currentNumberType = numberTypes.find((type) => type.id === numberType) || numberTypes[0]

  const fetchNumbers = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/numbers/${numberType}?windowSize=${windowSize}`)

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`)
      }

      const data = await res.json()
      setResponse(data)
      setAnimateNumber(true)

      // Reset animation after 2 seconds
      setTimeout(() => setAnimateNumber(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Chart data
  const chartData = {
    labels: response?.windowCurrState.map((_, index) => `#${index + 1}`) || [],
    datasets: [
      {
        label: "Current Window",
        data: response?.windowCurrState || [],
        borderColor: getComputedStyle(document.documentElement).getPropertyValue("--color-primary"),
        backgroundColor: `${getComputedStyle(document.documentElement).getPropertyValue("--color-primary")}33`,
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Window State Visualization",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              Average Calculator
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A powerful microservice that calculates averages from various number sequences
            </p>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold flex items-center">
                  <Calculator className="mr-2 h-6 w-6 text-purple-500" />
                  <span>Calculator Settings</span>
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Number Type Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {numberTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setNumberType(type.id)}
                        className={`flex items-center justify-center p-4 rounded-xl transition-all duration-200 ${
                          numberType === type.id
                            ? `bg-gradient-to-r ${type.color} text-white shadow-lg`
                            : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          {type.icon}
                          <span className="mt-1 font-medium">{type.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Window Size */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Window Size: {windowSize}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={windowSize}
                    onChange={(e) => setWindowSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                    <span>15</span>
                    <span>20</span>
                  </div>
                </div>

                {/* Calculate Button */}
                <button
                  onClick={fetchNumbers}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center
                    ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : `bg-gradient-to-r ${currentNumberType.color} hover:shadow-lg`
                    }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Calculate Average
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* API Information */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold mb-3">API Information</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>
                  <span className="font-medium">Endpoint:</span> /api/numbers/{"{type}"}
                </p>
                <p>
                  <span className="font-medium">Types:</span> p (Prime), f (Fibonacci), e (Even), r (Random)
                </p>
                <p>
                  <span className="font-medium">Query Params:</span> windowSize (default: 10)
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden h-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center">
                  <BarChart3 className="mr-2 h-6 w-6 text-purple-500" />
                  <span>Results</span>
                </h2>

                {response && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Type:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${currentNumberType.color}`}
                    >
                      {currentNumberType.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-4 flex items-start"
                    >
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <div>{error}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!response && !error && !loading && (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Calculator className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Data Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      Select a number type and window size, then click "Calculate Average" to see results.
                    </p>
                  </div>
                )}

                {response && (
                  <div className="space-y-6">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                      {["current", "previous", "numbers"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`py-2 px-4 font-medium text-sm transition-colors duration-200 capitalize
                            ${
                              activeTab === tab
                                ? `text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400`
                                : `text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300`
                            }`}
                        >
                          {tab} State
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[200px]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {activeTab === "current" && (
                            <div className="space-y-4">
                              <div className="flex flex-wrap gap-2">
                                {response.windowCurrState.length > 0 ? (
                                  response.windowCurrState.map((num, i) => (
                                    <div
                                      key={i}
                                      className={`px-3 py-1.5 rounded-lg font-medium text-white bg-gradient-to-r ${currentNumberType.color} shadow-sm`}
                                    >
                                      {num}
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-gray-500 dark:text-gray-400">No current state data available</p>
                                )}
                              </div>

                              {/* Chart */}
                              {response.windowCurrState.length > 0 && (
                                <div className="h-64 mt-6">
                                  <Line data={chartData} options={chartOptions} />
                                </div>
                              )}
                            </div>
                          )}

                          {activeTab === "previous" && (
                            <div className="flex flex-wrap gap-2">
                              {response.windowPrevState.length > 0 ? (
                                response.windowPrevState.map((num, i) => (
                                  <div
                                    key={i}
                                    className="px-3 py-1.5 rounded-lg font-medium text-white bg-gradient-to-r from-gray-500 to-gray-600 shadow-sm"
                                  >
                                    {num}
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 dark:text-gray-400">No previous state data available</p>
                              )}
                            </div>
                          )}

                          {activeTab === "numbers" && (
                            <div className="flex flex-wrap gap-2">
                              {response.numbers.length > 0 ? (
                                response.numbers.map((num, i) => (
                                  <div
                                    key={i}
                                    className="px-3 py-1.5 rounded-lg font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 shadow-sm"
                                  >
                                    {num}
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 dark:text-gray-400">No numbers received from API</p>
                              )}
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Average Result */}
                    <div className="mt-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Average Result</h3>
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-5 w-5 mr-1" />
                          <span className="text-sm font-medium">Calculation Complete</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-center">
                        <motion.div
                          className={`text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${currentNumberType.color}`}
                          animate={animateNumber ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          {response.avg.toFixed(2)}
                        </motion.div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
