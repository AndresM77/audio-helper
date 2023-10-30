import { AudioData } from "@/lib/database.types";
import { useRouter } from "next/navigation";
import React from "react";

export default function Modal({audioData}: {audioData: AudioData}) {
    const [showModal, setShowModal] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState<string | null>(null)
    const router = useRouter()
    const [searchResults, setSearchResults] = React.useState<string[] | null>(null)

    const semanticSearch = async () => {
        if (searchQuery) {
            const res = await fetch("openai/semantic-search", {
                method: "POST",
                body: JSON.stringify({inputText: searchQuery, audioItemId: audioData.id})
            }).catch(console.error);

            if (!res) {
                console.log("Error: Semantic search failed")
                return
            }
            
            const resultJson = await res.json()
            const topResults : string[] = []
            Object.entries(resultJson.documents).forEach( ([key, value] : [any, any]) => {
                topResults.push(value["content"])
            });

            console.log(resultJson)

            setSearchResults(topResults)
            router.refresh();
        }
    }

    const closeModal = () => {
        setShowModal(false)
        setSearchQuery(null)
        setSearchResults(null)
    }
    
  return (
    <>
      <button
        className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
        type="button"
        onClick={() => setShowModal(true)}
      >
        Search
      </button>
      {showModal ? (
        <>
          <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none p-6"
          >
            <div className="flex flex-auto w-auto my-6 mx-auto max-w-4xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                  <h3 className="text-3xl font-semibold">
                    Search Transcription
                  </h3>
                  <button
                    className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={closeModal}
                  >
                    <span className=" text-black h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                {!searchResults ? 
                    <input
                        className="rounded-md px-4 py-2 bg-inherit border items-center m-6"
                        type="input"
                        id="search"
                        placeholder="Write your search query"
                        onChange={evt => setSearchQuery(evt.target.value)}/>:
                    <div className="p-6 flex flex-col gap-2">{
                        searchResults.map((searchResult, index) => 
                            <div className="flex flex-col gap-1" key={index}>
                                <p className="font-bold hover:underline">Result {index + 1}:</p>
                                <p>"{searchResult}"</p>
                            </div>
                    )}</div>
                }
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  {!searchResults ? <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={semanticSearch}
                  >
                    Search
                  </button> : null }
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}