import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import AudioRecorder from './AudioRecorder'
import AudioItem from './AudioItem'
import AuthButton from '@/components/AuthButton'
import { redirect } from 'next/navigation'
import RealtimeAudioItems from './RealtimeAudioItems'


export const dynamic = 'force-dynamic'

export default async function Home() {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const {data: audioItems} = await supabase.from('audio_data').select()
    const { data: {session} } = await supabase.auth.getSession()

    if (!session) {
        redirect("/")
    }

    return (
    <div className="flex items-center flex-col w-full gap-5">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
                <p className="text-2xl lg:text-2xl items-center justify-center !leading-tight font-bold">Audio Helper</p>
                <AuthButton/>
            </div>
        </nav>
        <div className="flex flex-col items-center gap-12">
            <AudioRecorder/>
            {audioItems && 
                <div className="flex items-center flex-col gap-4">
                    <p className="text-3xl lg:text-4xl !leading-tight text-center font-bold hover:underline">Recorded Audio</p>
                    <RealtimeAudioItems audioItems={audioItems}/>
                </div>
            }
        </div>
    </div>
    )
}
