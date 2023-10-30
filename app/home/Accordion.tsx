import ChevronUpLogo from '@/components/ChevronUpLogo'
import React, { useRef, useState } from 'react'

interface AccordionProps {
  title: React.ReactNode
  content: React.ReactNode
  created_at: string | null
}

export const Accordion: React.FC<AccordionProps> = ({ title, content, created_at }) => {
  const [active, setActive] = useState(false)
  const [height, setHeight] = useState('0px')
  const [rotate, setRotate] = useState('transform duration-700 ease')

  const contentSpace = useRef(null)

  function toggleAccordion() {
    setActive((prevState) => !prevState)
    // @ts-ignore
    setHeight(active ? '0px' : `${contentSpace.current.scrollHeight}px`)
    setRotate(active ? 'transform duration-700 ease' : 'transform duration-700 ease rotate-180')
  }

  return (
    <div className="flex flex-col">
      <button
        className="py-1 pb-6 box-border appearance-none cursor-pointer focus:outline-none flex flex-col gap-4 items-center justify-start"
        onClick={toggleAccordion}
      >
        {created_at ? <p className='font-bold'>{created_at}</p> : null}
        <div className='flex flex-row gap-4 items-center justify-start'>
          <div className={`${rotate} inline-block`}>
              <ChevronUpLogo/>
          </div>
          <div className="inline-block text-footnote light">{title}</div>
        </div>
      </button>
      <div
        ref={contentSpace}
        style={{ maxHeight: `${height}` }}
        className="overflow-auto transition-max-height ease-in-out"
      >
        <div className="pb-10">{content}</div>
      </div>
    </div>
  )
}