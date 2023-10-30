import AuthButton from '../components/AuthButton'
import { createClient } from '@/utils/supabase/server'
import Header from '@/components/Header'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Index() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: {session} } = await supabase.auth.getSession();

  const canInitSupabaseClient = () => {
    try {
      createClient(cookieStore)
      return true
    } catch (e) {
      return false
    }
  }

  const isSupabaseConnected = canInitSupabaseClient()
  
  if (session) {
    redirect("/home")
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <p className="text-2xl lg:text-2xl items-center justify-center !leading-tight font-bold">Audio Helper</p>
          {isSupabaseConnected && <AuthButton />}
        </div>
      </nav>

      <div className="animate-in flex-1 flex flex-col gap-10 opacity-0 max-w-4xl px-3">
        <Header/>
        <main className="flex-1 flex flex-row gap-6">
          <a href="/login" className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Transcribe Audio</h5>
              <p className="font-normal text-gray-700 dark:text-gray-400"> Record your voice and we will automatically transcribe it into text! </p>
          </a>
          <a href="/login" className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Summarize Meetings</h5>
              <p className="font-normal text-gray-700 dark:text-gray-400"> Don't have time to read through a long transcription of your meeting? Don't worry, we'll automatically summarize it for you!</p>
          </a>
          <a href="/login" className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Search Transcriptions</h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">Looking through pages of text to find information you need is a thing of the past! Ask us any question about your meeting and we'll show you our relevant information!</p>
          </a>
        </main>
      </div>

      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p> Built by{' '} <b>Andres</b> </p>
      </footer>
    </div>
  )
}
