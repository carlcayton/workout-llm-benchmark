import { useState } from 'react'
import { TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
import { Gallery } from './components/gallery'
import { VideoComparison } from './components/comparison'
import { LLMBenchmark } from './components/benchmark'
import { Beaker, Image, Video, Brain } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('gallery')

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Beaker className="w-6 h-6 text-zinc-700" />
              <h1 className="text-xl font-semibold">Prototype Showcase</h1>
            </div>

            <TabsList>
              <TabsTrigger
                value="gallery"
                activeValue={activeTab}
                onClick={setActiveTab}
              >
                <Image className="w-4 h-4 mr-1.5" />
                Gallery
              </TabsTrigger>
              <TabsTrigger
                value="video"
                activeValue={activeTab}
                onClick={setActiveTab}
              >
                <Video className="w-4 h-4 mr-1.5" />
                Video Models
              </TabsTrigger>
              <TabsTrigger
                value="benchmark"
                activeValue={activeTab}
                onClick={setActiveTab}
              >
                <Brain className="w-4 h-4 mr-1.5" />
                LLM Benchmark
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <TabsContent value="gallery" activeValue={activeTab}>
          <Gallery />
        </TabsContent>

        <TabsContent value="video" activeValue={activeTab}>
          <VideoComparison />
        </TabsContent>

        <TabsContent value="benchmark" activeValue={activeTab}>
          <LLMBenchmark />
        </TabsContent>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-zinc-500">
          <p>Fitness App Prototypes • Exercise GIFs • Video Generation • LLM Comparison</p>
          <p className="mt-1">Built with React + Vite + Tailwind + shadcn/ui</p>
        </div>
      </footer>
    </div>
  )
}

export default App
