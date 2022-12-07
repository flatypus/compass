import React from 'react';
import { useDarkMode as useLeafyGreenDarkMode } from '@leafygreen-ui/leafygreen-provider';

enum Theme {
  Light = 'Light',
  Dark = 'Dark',
}

export function useDarkMode(): boolean | undefined {
  const darkMode = useLeafyGreenDarkMode();

  return darkMode.darkMode;
}

interface WithDarkModeProps {
  darkMode?: boolean;
}

// High Order Component(HOC) used to inject Compass' theme pulled from the available
// theme on the React context from LeafyGreen's provider into the wrapped component.
const withDarkMode = function <
  ComponentProps extends WithDarkModeProps = WithDarkModeProps
>(
  WrappedComponent: React.ComponentType<ComponentProps & WithDarkModeProps>
): React.ComponentType<ComponentProps> {
  const ComponentWithDarkMode = (
    props: ComponentProps,
    ref: React.ForwardedRef<
      React.ComponentType<ComponentProps & WithDarkModeProps>
    >
  ) => {
    const darkMode = useDarkMode();
    return (
      <WrappedComponent
        // Set the darkMode before the props so that the props can
        // override the theme if needed.
        darkMode={darkMode}
        ref={ref}
        {...props}
      />
    );
  };

  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';
  ComponentWithDarkMode.displayName = `WithDarkMode(${displayName})`;

  return React.forwardRef(ComponentWithDarkMode) as typeof WrappedComponent;
};

export { Theme, withDarkMode };
