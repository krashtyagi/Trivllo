import React from 'react'

type Props = {
    handleClick: () => void;
}

const SliderIfNotChooseDateContext = React.createContext<Props | null>(null);
const SliderIfNotChooseDate = ({children,handleClick}:{children:React.ReactNode,handleClick:()=>void}) => {
  return (
    <SliderIfNotChooseDateContext.Provider value={{handleClick}}>
    {children}
    </SliderIfNotChooseDateContext.Provider>
  )
}

export default SliderIfNotChooseDate

export const useSliderIfNotChooseDate  = ()=>{
    const context = React.useContext(SliderIfNotChooseDateContext);
    if (!context) {
        throw new Error("useSliderIfNotChooseDate must be used within SliderIfNotChooseDateProvider");
    }
    return context;
}