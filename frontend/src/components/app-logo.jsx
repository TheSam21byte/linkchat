import logoImage from '../assets/logo.png'

function AppLogo({
  className = '',
  imageClassName = '',
  labelClassName = '',
  showLabel = false,
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className="grid shrink-0 place-items-center overflow-hidden rounded-lg bg-white shadow-lg shadow-teal-950/20">
        <img
          src={logoImage}
          alt="LinkChat"
          className={`size-12 object-contain ${imageClassName}`}
        />
      </span>
      {showLabel ? (
        <span className={`font-bold tracking-normal ${labelClassName}`}>
          LinkChat
        </span>
      ) : null}
    </span>
  )
}

export default AppLogo
