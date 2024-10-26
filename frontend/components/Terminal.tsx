import React from 'react'
import { Loader2 } from 'lucide-react'

interface TerminalProps {
  output: string
  isLoading?: boolean
}

const Terminal: React.FC<TerminalProps> = ({ output, isLoading = false }) => {
  return (
    <div className="bg-[#1e1e1e] text-white p-4 h-full overflow-hidden font-mono rounded-md shadow-lg flex flex-col">
      <div className="flex items-center mb-2">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex-grow text-center text-sm text-gray-400">Output</div>
      </div>
      <div className="flex-grow overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-blue-500">Running code...</span>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap break-words">{output || 'No output yet. Run your code to see results.'}</pre>
        )}
      </div>
      <div className="mt-2 flex items-center">
        <span className="text-green-500 mr-2">$</span>
        <div className="w-2 h-5 bg-white animate-pulse"></div>
      </div>
    </div>
  )
}

export default Terminal