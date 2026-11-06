import { Button } from "@/components/ui/button";
// import { useSignUp } from '@/hooks/auth/use-signup'
import type { SignUpProps } from "@/schema/auth";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { useSignUp } from "../hooks/use-signup";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";

const ProcessButtonHandler = ({
    currentStep,
    setCurrentStep,
    methods,
    loading,
    submitStep_1,
    submitStep_2,
    submitStep_3,
}: {
    currentStep: number;
    methods: UseFormReturn<SignUpProps>;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    loading: boolean;
    submitStep_1: any;
    submitStep_2: any;
    submitStep_3: any;
}) => {
    const { getValues } = methods;

    const { setCurrStep } = useAuthStore();
    switch (currentStep) {

        case 2:
            return (
                <Button
                    type="submit"
                    variant={"default"}
                    className="w-full"
                    disabled={loading}
                    {...(
                        true && {
                            onClick: async (e) => {
                                e.preventDefault();
                                const isValid = await methods.trigger([
                                    "serviceType",
                                    "businessName",
                                    "businessEmail",
                                    "businessPhone",
                                    "businessAddress",
                                    "city",
                                    "state",
                                    "panNumber",
                                    "aadhaarNumber",
                                    "verificationDocs"
                                ]);
                                if (!isValid) {
                                    toast.error("Please fill in all business details correctly.");
                                    return;
                                }
                                submitStep_1(
                                    getValues("serviceType"),
                                    getValues("businessName"),
                                    getValues("businessEmail"),
                                    getValues("businessPhone"),
                                    getValues("businessAddress"),


                                    getValues("city"),
                                    getValues("state"),
                                    getValues("country"),
                                    getValues("panNumber"),
                                    getValues("aadhaarNumber"),
                                    getValues("verificationDocs"),
                                    setCurrentStep);
                            },
                        })}
                >
                    {
                        loading ? <Spinner /> : "submit business details"
                    }
                </Button>
            )
        case 3:
            return (
                <div className="flex gap-4 w-full">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-1/3"
                        disabled={loading}
                        onClick={() => {
                            setCurrentStep(2);
                            setCurrStep(2);
                        }}
                    >
                        Back
                    </Button>
                    <Button
                        type="submit"
                        variant={"default"}
                        className="w-2/3"
                        disabled={loading}
                        {...(
                            true && {
                                onClick: async (e) => {
                                    e.preventDefault();
                                    const isValid = await methods.trigger([
                                        "bankName",
                                        "accountNumber",
                                        "ifscCode",
                                        "branchName",
                                        "accountHolderName",
                                        "bankProof"
                                    ]);
                                    if (!isValid) {
                                        toast.error("Please fill in all bank details correctly.");
                                        return;
                                    }
                                    submitStep_2(
                                        getValues("bankName"),
                                        getValues("accountNumber"),
                                        getValues("ifscCode"),
                                        getValues("branchName"),
                                        getValues("accountHolderName"),
                                        getValues("bankProof"),
                                        setCurrentStep);
                                },
                            })}
                    >
                        {
                            loading ? <Spinner /> : "submit bank details"
                        }
                    </Button>
                </div>
            )
        case 4:
            return (
                <div className="flex gap-4 w-full">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-1/3"
                        disabled={loading}
                        onClick={() => {
                            setCurrentStep(3);
                            setCurrStep(3);
                        }}
                    >
                        Back
                    </Button>
                    <Button
                        type="submit"
                        variant={"default"}
                        className="w-2/3"
                        disabled={loading}
                        {...(
                            true && {
                                onClick: async (e) => {
                                    e.preventDefault();
                                    const isValid = await methods.trigger([
                                        "name",
                                        "description",
                                        "hotelAddress",
                                        "hotelCity",
                                        "location",
                                        "images",
                                        "documents",
                                        "amenities"
                                    ]);
                                    if (!isValid) {
                                        const errors = methods.formState.errors;
                                        let errorMessage = "Please fill in all required details correctly.";
                                        
                                        if (errors.name?.message) errorMessage = `Name: ${errors.name.message}`;
                                        else if (errors.description?.message) errorMessage = `Description: ${errors.description.message}`;
                                        else if (errors.hotelAddress?.message) errorMessage = `Address: ${errors.hotelAddress.message}`;
                                        else if (errors.hotelCity?.message) errorMessage = `City: ${errors.hotelCity.message}`;
                                        else if (errors.images?.message) errorMessage = `Gallery: ${errors.images.message}`;
                                        else if (errors.documents?.message) errorMessage = `Documents: ${errors.documents.message}`;
                                        else if (errors.amenities?.message) errorMessage = `Amenities: ${errors.amenities.message}`;

                                        toast.error(errorMessage);
                                        return;
                                    }
                                    submitStep_3(
                                        getValues("serviceType"),
                                        getValues("name"),
                                        getValues("hotelAddress"),
                                        getValues("description"),
                                        getValues("amenities") || [],
                                        getValues("documents") || [],
                                        getValues("images") || [],
                                        getValues("hotelCity"),
                                        getValues("location"),
                                        setCurrentStep,
                                        {
                                            adventureCategory: getValues("adventureCategory"),
                                            logo: getValues("logo"),
                                            extraAddress: {
                                                buildingName: getValues("buildingName"),
                                                doorNumber: getValues("doorNumber"),
                                                streetAddress: getValues("streetAddress") || getValues("hotelAddress"),
                                                areaName: getValues("areaName"),
                                                city: getValues("hotelCity"),
                                                district: getValues("district"),
                                                state: getValues("state"),
                                                postalCode: getValues("postalCode"),
                                                country: getValues("country") || "India",
                                                landmark: getValues("landmark"),
                                                directions: getValues("directions"),
                                                formattedAddress: getValues("formattedAddress") || getValues("hotelAddress"),
                                            },
                                        }
                                    );
                                },
                            })}
                    >
                        {
                            loading ? <Spinner /> : "Save and submit"
                        }
                    </Button>
                </div>
            )
    }
    return (
        <div className="flex items-center justify-center">
            <p className="text-center">
                Please wait for the response
            </p>
        </div>
        // <Button
        //     type="submit"
        //     variant={"default"}
        //     className="w-full"
        //     {...(
        //         true && {
        //             onClick: () => {
        //                 submitStep_4(setCurrentStep);
        //             },
        //         })}
        // >
        //     Save and submit
        // </Button>
    );
};

export default ProcessButtonHandler;
