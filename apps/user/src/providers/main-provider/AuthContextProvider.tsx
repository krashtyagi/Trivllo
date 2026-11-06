// import { Sign_in_hover } from '@/components/auth/_components/sign-in-hover';
// import React from 'react'

// type Props = {
//     children: React.ReactNode
// }
// interface AuthContextType {
//     nextRoute: string;
//     setNextRoute: React.Dispatch<React.SetStateAction<string>>;
    
// }
// const AuthContext = React.createContext<AuthContextType | null>(null)
// const AuthContextProviderOfLogin = (props: Props) => {
//     const [nextRoute, setNextRoute] = React.useState<string>("/")
//     const [loginInPageOpen, setLoginPageOpen] = React.useState<boolean>(false)
//   return (
//     <AuthContext.Provider value={{nextRoute, setNextRoute}}>{props.children}
    
    
//     </AuthContext.Provider>
//   )
// }

// export default AuthContextProviderOfLogin

// export const useAuthContext = () =>{
//     const context = React.useContext(AuthContext)
//     if (!context) {
//         throw new Error("useAuthContext must be used within an AuthContextProvider")
//     }
//     return context
// }