import React from 'react';

const RadioGroup = ({ value, onValueChange, children, className = '' }) => {
  return (
    <div className={`flex space-x-4 ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === RadioGroupItem) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onChange: () => onValueChange(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
};

const RadioGroupItem = ({ value, checked, onChange, children, id }) => {
  return (
    <div className="flex items-center">
      <input
        type="radio"
        id={id}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
        {children}
      </label>
    </div>
  );
};

export { RadioGroup, RadioGroupItem };