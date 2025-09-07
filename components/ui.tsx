"use client";

import React from 'react';

// A helper for conditional class names
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Button
export const Button = ({ children, variant, size, className = '', ...props }) => {
    const sizeClass = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : size === 'icon' ? 'icon' : 'default';
    return (
        <button className={cn('button', variant, sizeClass, className)} {...props}>
            {children}
        </button>
    );
};

// Card
export const Card = ({ children, className = '', ...props }) => <div className={cn('card', className)} {...props}>{children}</div>;
export const CardHeader = ({ children, className = '', ...props }) => <div className={cn('card-header', className)} {...props}>{children}</div>;
export const CardTitle = ({ children, className = '', ...props }) => <h3 className={cn('card-title', className)} {...props}>{children}</h3>;
export const CardDescription = ({ children, className = '', ...props }) => <p className={cn('card-description', className)} {...props}>{children}</p>;
export const CardContent = ({ children, className = '', ...props }) => <div className={cn('card-content', className)} {...props}>{children}</div>;
export const CardFooter = ({ children, className = '', ...props }) => <div className={cn('card-footer', className)} {...props}>{children}</div>;

// Input
export const Input = ({ className = '', ...props }) => <input className={cn('input', className)} {...props} />;

// Label
export const Label = ({ children, className = '', ...props }) => <label className={cn('label', className)} {...props}>{children}</label>;

// Progress
export const Progress = ({ value, className = '', ...props }) => <progress value={value} max="100" className={cn('progress', className)} {...props} />;

// Alert
export const Alert = ({ children, variant, className = '', ...props }) => <div className={cn('alert', variant, className)} {...props} role="alert">{children}</div>;
export const AlertTitle = ({ children, className = '', ...props }) => <h4 className={cn('alert-title', className)} {...props}>{children}</h4>;
export const AlertDescription = ({ children, className = '', ...props }) => <p className={cn('alert-description', className)} {...props}>{children}</p>;

// Badge
export const Badge = ({ children, variant, className = '', ...props }) => <span className={cn('badge', variant, className)} {...props}>{children}</span>;

// Textarea
export const Textarea = ({ className = '', ...props }) => <textarea className={cn('textarea', className)} {...props} />;

// Slider
export const Slider = ({ onValueChange, className = '', ...props }) => {
    const handleChange = (e) => {
        if (onValueChange) {
            onValueChange([parseInt(e.target.value, 10)]);
        }
    };
    
    const defaultValue = props.defaultValue ? props.defaultValue[0] : undefined;
    
    // Remove custom props from what's passed to the input element
    const { defaultValue: _, onValueChange: __, ...rest } = props;

    return <input type="range" className={cn('slider', className)} onChange={handleChange} defaultValue={defaultValue} {...rest} />;
};