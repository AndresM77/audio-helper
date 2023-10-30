
export default function Header() {
  return (
    <div className="flex flex-col gap-5 items-center">
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        We take notes for your meetings so you dont have to.
      </p>
      <p className="text-3x1 sm:text !leading-tight mx-auto max-w-xl text-center underline">
        Note: this website does not work on phones.
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  )
}
