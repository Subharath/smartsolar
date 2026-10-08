const variants = {
  primary: 'bg-leaf text-white hover:bg-deepGreen focus:ring-leaf',
  secondary: 'bg-deepGreen text-white hover:bg-leaf focus:ring-deepGreen',
  accent: 'bg-solar text-deepGreen hover:brightness-95 focus:ring-solar',
  outline: 'bg-white text-deepGreen border border-deepGreen/30 hover:bg-offWhite focus:ring-deepGreen',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'bg-transparent text-deepGreen hover:bg-offWhite focus:ring-deepGreen',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
