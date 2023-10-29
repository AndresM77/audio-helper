import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import AudioRecorder from './AudioRecorder'
import AudioItem from './AudioItem'
import AuthButton from '@/components/AuthButton'
import { redirect } from 'next/navigation'


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
    <div>
        <AuthButton/>
        <AudioRecorder/>
        {audioItems?.map(audioData => 
            <AudioItem audioData={audioData}/>
        )}
    </div>
    )
}
