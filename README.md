# Audio Helper
## Relevant links
- [Website](https://audio-helper.vercel.app/home)
- [Video Demo](https://drive.google.com/file/d/1dxOX1XmBcXTJFjX4-K-53Tzm38iYuGIL/view?usp=sharing)

## How I did transcription
I transcribed the audio directly from the client side. This was an interesting problem to figure out due to how OpenAI had their packages setup. If you were to try to transcribe data through one of OpenAI’s packages you would need to actually download your file to the server so you can reference the file location when using the api. This forces you to queue all of your api requests related to transcription (if multiple users were transcribing at the same time) as you need to wait for each user to write and remove their mp3 file (slowing down things further especially for big audio files). This was one of the main reasons I decided to switch off Flask (I originally set up the project with NextJS and Flask) and rewrote the whole website with a pure NodeJs backend as well.
## How I did summarization 
In order to summarize data, I continuously aggregated summaries of chunks. For context, in order to summarize any piece of data with an LLM, you have to chunk it into small enough pieces of text so that the LLM would accept it. However, for large audio files this means you have to somehow aggregate summaries. The way I did it was by getting a summary from an initial chunk and then telling OpenAI’s LLM to amend my current summary based on the information in the next chunk. This allowed me to keep context between each summary and produce a better summary than the conventional map reduce approach which summarizes two summaries together (it also results in n summary calls rather than nlogn summary calls).

The header was simply me asking the LLM to make a heading for the generated summary. As the resulting summary was under the chunk size, this was fairly straightforward.
## How I did semantic search
Semantic search was fairly simple. I chunked up the transcription into fairly small pieces of text, created an embedding with OpenAI’s embedding api for each individual chunk, and stored the embedding/text pairs in the Supabase DB. Once the embeddings for an audio object were created search was possible. I would then create an embedding for my search query and then run it through a SQL function within Supabase that I made which returns at most 5 embedding/text pairs which meet the threshold requirements for similarity.
## Tech Stack
- Frontend: NextJs, Tailwind CSS, Typescript
- Backend: Supabase, NodeJs
- AI APIs: OpenAI
## Features
- User Authentication
- Audio Recording
- Automatic Transcription
- Summarization
- Semantic Search
- Subscription to DB changes (updates UI with new info)
- Cookie based sessions and middleware to refresh cookies
- Authenticate users (and differentiate data between users)
