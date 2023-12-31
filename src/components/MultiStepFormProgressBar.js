import React from "react";
import Heading from "./Heading";
import Wrapper from "./Wrapper";
import "styles/MultiStepFormProgressBar.css";
import Icon from "./Icon";

// Example data for this component
//     const steps = [
//         {
//             stepIcon: "trash-alt",
//             stepName: "Basic Informationsssss",
//         },
//         {
//             stepIcon: "trash-alt",
//             stepName: "asdasd",
//         },
//         {
//             stepIcon: "trash-alt",
//             stepName: "Information",
//         },
//         {
//             stepIcon: "trash-alt",
//             stepName: "Basic",
//         },
//     ];

/**
 * Layout of the multi step form and the progress bar
 * @param {*} steps the steps of the multi step form include the icon and the name of the step
 * @param {*} currentStep the current step of the multi step form
 * @param {*} children the main content of the multi step form
 * @returns
 */
const MultiStepFormProgressBar = ({
    steps = [{ stepIcon: [""], stepName: "" }],
    currentStep,
    className = "",
}) => {
    return (
        <div className={className}>
            {steps.map((step, index) => {
                return (
                    <React.Fragment key={index}>
                        <div className="oneStep">
                            <span
                                className={`title ${
                                    index <= currentStep && "activeStep"
                                }`}
                            >
                                {/* StepName should only have < = 22 characters :(( */}
                                {step.stepName}
                            </span>
                            <span
                                className={`titleIcon ${
                                    index <= currentStep && "activeIcon"
                                }`}
                            >
                                <Icon
                                    icon={step.stepIcon}
                                    style={{
                                        fontSize: "1.1rem",
                                    }}
                                    color={
                                        index <= currentStep
                                            ? "#fff"
                                            : "#949494"
                                    }
                                />
                            </span>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default MultiStepFormProgressBar;
