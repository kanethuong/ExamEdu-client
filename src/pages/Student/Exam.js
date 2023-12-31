import OurModal from "components/OurModal";
import Heading from "components/Heading";
import Wrapper from "components/Wrapper";
import { API } from "utilities/constants";
import styles from "../../styles/Exam.module.css";
import Icon from "components/Icon";
import moment from "moment";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLazyFetch, useFetch } from "utilities/useFetch";
import useOutsideClick from "utilities/useOutsideClick";
import { useSelector } from "react-redux";
import Loading from "pages/Loading";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import StudentCall from "./StudentCall";

//Exam header include Exam name, module and time
function ExamHeader({ examId, result, submitAnswer }) {

    const [minutes, setMinutes] = useState(result?.maxFinishTime == null ? result?.durationInMinute : moment(result?.maxFinishTime).diff(moment(), "minutes"));
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        let myInterval = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1);
            }
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(myInterval);
                    //When time up, submit answer
                    submitAnswer();
                } else {
                    setMinutes(minutes - 1);
                    setSeconds(59);
                }
            }
        }, 1000);
        return () => {
            clearInterval(myInterval);
        };
    });

    return (
        <header
            className={`d-md-flex justify-content-md-around ${styles.exam_header}`}
        >
            <StudentCall examId={examId} />
            <div className="d-md-flex align-items-center">
                <div>
                    {/* Exam Name */}
                    <div className={`fs-4 `}>
                        <b>
                            {result?.isFinalExam
                                ? "Final Exam"
                                : "Progress Test"}
                        </b>
                    </div>
                    {/* Exam module */}
                    <div className={`fs-6`}>{result?.moduleCode}</div>
                </div>
            </div>

            {/* Exam time left */}
            <div className="me-md-5 d-md-flex align-items-center">
                {/* <Icon icon="clock" className="me-2"></Icon> */}
                {minutes === 0 && seconds === 0 ? null : (
                    <span className={`fs-4`}>
                        <Icon
                            icon="clock"
                            className="me-1"
                            color="var(--color-blue)"
                        ></Icon>
                        {minutes}:{seconds < 10 ? `0${seconds}` : seconds} Min
                    </span>
                )}
            </div>
        </header>
    );
}
// Modal to display question number in mobile view
const NumberQuestionModal = ({ children }) => {
    const modalRef = useRef(null);
    const { isClicked, setIsClicked } = useOutsideClick(modalRef);
    return (
        <>
            <Icon
                className={`d-inline d-md-none`}
                id={styles.btnModal}
                icon="bars"
                onClick={setIsClicked}
            />
            <OurModal
                modalRef={modalRef}
                isClicked={isClicked}
                setIsClicked={setIsClicked}
                modalClassName={`d-md-none ${styles.question_modal}`}
            >
                <div>
                    <div className={`text-center ${styles.questionBlock}`}>
                        {/* children is array of number question */}
                        {children}
                    </div>
                    <div>
                        <Icon
                            icon="circle"
                            className="me-3 ms-2"
                            style={{ color: "#7AE765" }}
                        ></Icon>
                        Attempted
                    </div>
                    <div>
                        <Icon
                            icon="circle"
                            className="me-3 ms-2"
                            style={{ color: "var(--color-blue)" }}
                        ></Icon>
                        To be review
                    </div>
                </div>
            </OurModal>
        </>
    );
};

//Question number button
function NumberQuestion({ number, onClick, color }) {
    return (
        <button
            className={`btn btn-secondary ${styles.questionButton}`}
            type="button"
            onClick={onClick}
            style={{ backgroundColor: color }}
        >
            {number}
        </button>
    );
}

function Exam() {
    const [headers, setHeaders] = useState();

    const checkSEB = useFetch(`${API}/exam/SEB`, {
        onCompletes: (data) => {
            setHeaders(data["User-Agent"].toString());
        }
    });

    const history = useHistory();
    const param = useParams();
    const examId = param.examId;

    const user = useSelector((state) => state.user);
    const { data, loading, error } = useFetch(
        `${API}/ExamQuestions/${examId}?studentId=${user.accountId}`
    );

    if (error?.status) {
        Swal.fire("Error", error.message, "error");
        history.push(`/student`);
    }

    const [question, setQuestion] = useState(0);
    const [answerChecked, setAnswerChecked] = useState();
    const [listAnswer, setListAnswer] = useState([]);
    const [essayAnswer, setEssayAnswer] = useState("");
    const [reviewQuestion, setReviewQuestion] = useState([]);

    // console.log("Before: ");
    // console.log(data?.questionAnswer[0].answers);
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);
    useEffect(() => {
        data?.questionAnswer.map((question) => {
            question.answers.sort((a, b) => 0.5 - Math.random());
        });
        forceUpdate();
    }, [loading]);

    //Load lần đầu lấy data câu trả lời cũ lên từ local Storage
    useEffect(() => {
        if (localStorage.getItem(`ExamEduKey/${examId}`) !== null) {
            const oldAnswerKey = localStorage.getItem(`ExamEduKey/${examId}`);
            setListAnswer(JSON.parse(oldAnswerKey));
        }
    }, []);

    //Cập nhật lại local Storage mỗi khi chọn xong 1 câu
    useEffect(() => {
        localStorage.setItem(
            `ExamEduKey/${examId}`,
            JSON.stringify(listAnswer)
        );
    }, [listAnswer]);

    const [studentDisconnect, studentDisconnectResponse] = useLazyFetch(
        `${API}/invigilate/studentDisconnect`,
        {
            method: "POST",
            body: {
                ExamId: examId,
                RoomId: user.email
            }
        }
    );

    const addAnswerToList = (answer, examQuestion) => {
        answer = String(answer);

        //get all answer Id in each question
        let arrId = data?.questionAnswer[question].answers.map((a) =>
            String(a.answerId)
        );

        if (
            arrId.includes(answer) &&
            !listAnswer.some((r) => arrId.indexOf(r.studentAnswerContent) >= 0) //List answer does not have this answer
        ) {
            setListAnswer([
                ...listAnswer,
                {
                    studentAnswerContent: answer,
                    studentId: user.accountId,
                    examQuestionId: examQuestion
                }
            ]); //If list answer does not have the answer of this question, add answer to list

            // In case user want to change the answer after choose one
        } else if (
            !listAnswer.map((a) => a.studentAnswerContent).includes(answer) &&
            arrId.includes(answer) //If list answer does not have the same input answer of THIS question (so we need to replace the old answer with new input answer)
        ) {
            //lấy ra answer before
            let previousAnswer = listAnswer
                .map((a) => a.studentAnswerContent)
                .filter((value) => arrId.includes(value)); //lọc ra những thằng trong listAnswer có mặt trong arrId

            // get index of previous answer to replace
            let previousAnswerIndex = listAnswer.findIndex(
                (prev) => prev.studentAnswerContent === previousAnswer[0]
            );
            // replace previous answer with new answer
            listAnswer.splice(previousAnswerIndex, 1, {
                studentAnswerContent: answer,
                studentId: user.accountId,
                examQuestionId: examQuestion
            });
        }
    };
    const addEssayAnswerToList = (essayAnswerParam, examQuestion) => {
        if (essayAnswerParam === "") return;
        //in case list answer does not have this essay answer, add the essay answer to list
        if (!listAnswer.some((r) => r.examQuestionId === examQuestion)) {
            setListAnswer([
                ...listAnswer,
                {
                    studentAnswerContent: essayAnswerParam,
                    studentId: user.accountId,
                    examQuestionId: examQuestion
                }
            ]);
        } else {
            //in case list answer have this essay answer, replace the new essay answer to list
            //get the old answer
            let previousAnswer = listAnswer.filter(
                (ans) => ans.examQuestionId === examQuestion
            );
            // get index of previous answer to replace
            let previousAnswerIndex = listAnswer.findIndex(
                (prev) =>
                    prev.examQuestionId === previousAnswer[0].examQuestionId
            );
            // replace previous answer with new answer
            listAnswer.splice(previousAnswerIndex, 1, {
                studentAnswerContent: essayAnswerParam,
                studentId: user.accountId,
                examQuestionId: examQuestion
            });
        }
        setEssayAnswer("");
    };
    const addToReviewLaterList = (thisQuestion) => {
        if (reviewQuestion.some((q) => q === thisQuestion)) return;
        setReviewQuestion([...reviewQuestion, thisQuestion]);
    };
    const removeQuestionInReviewList = (thisQuestion) => {
        // remove the input question in review later list
        if (reviewQuestion.some((q) => q === thisQuestion)) {
            setReviewQuestion(reviewQuestion.filter((q) => q !== thisQuestion));
        }
    };

    // useEffect to call function remove question in review Later list when change question (click next, previous or number button)
    useEffect(() => {
        removeQuestionInReviewList(
            data?.questionAnswer[question].examQuestionId
        );
    }, [question]);

    //hàm để hiện lên SweetAlert để hỏi lại khi nhấn submit
    function showModalConfirmSubmit() {
        // nếu có câu hỏi chưa được chọn thì hiện sweetalert
        if (listAnswer.length < data?.questionAnswer.length) {
            Swal.fire({
                title: "Are you sure?",
                text: "You have some question not answered yet!",
                icon: "error",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, submit it!"
            }).then((result) => {
                if (result.isConfirmed) {
                    submitAnswer();
                }
            });
        } else {
            Swal.fire({
                title: "Are you sure?",
                text: "Do you really want to submit the exam?",
                icon: "info",
                showCancelButton: true,
                confirmButtonColor: "#e76565",
                cancelButtonColor: "#363940",
                confirmButtonText: "Confirm",
                customClass: {
                    popup: "roundCorner"
                }
            }).then((result) => {
                //nếu người dùng nhấn OK
                if (result.isConfirmed) {
                    submitAnswer();
                }
            });
        }
    }
    const submitAnswer = () => {
        if (data?.isFinalExam) {
            //Gọi hàm postAnswer
            postAnswer(
                `${API}/Answer/FE?examId=${examId}&studentId=${user.accountId}`
            );
        }
        //Gọi hàm postAnswer
        else
            postAnswer(
                `${API}/Answer/PT?examId=${examId}&studentId=${user.accountId}`
            );
    };
    //submit answer and show student multiple choice mark
    const [postAnswer, postAnswerResult] = useLazyFetch("", {
        method: "POST",
        body: listAnswer,
        onCompletes: (dataComplete) => {
            history.push(`/student/mark/report/${data.moduleId}`);
            studentDisconnect();
            Swal.fire({
                title: "Submit exam successfully",
                html: dataComplete.message,
                icon: "success",
                confirmButtonColor: "#7AE765",
                confirmButtonText: "Ok",
                allowOutsideClick: false,
                customClass: {
                    popup: "roundCorner"
                }
            });
            //Xóa file các câu trả lời của bài thi khi submit bài xong
            localStorage.removeItem(`ExamEduKey/${examId}`);
        },
        onError: (error) => {
            Swal.fire("Error", error.message, "error");
        }
    });
    document.onkeydown = function (e) {
        switch (e.keyCode) {
            case 37:
                //arrow left button to previous question
                addEssayAnswerToList(
                    essayAnswer,
                    data?.questionAnswer[question].examQuestionId
                );
                if (question > 0) setQuestion(question - 1);
                break;
            case 39:
                // arrow right button to next question
                addEssayAnswerToList(
                    essayAnswer,
                    data?.questionAnswer[question].examQuestionId
                );
                if (data?.questionAnswer.length - 1 > question)
                    setQuestion(question + 1);
                break;
        }
    };

    if (headers !== undefined && !headers.includes("SEB")) {
        return (
            <Wrapper className="d-flex justify-content-center align-items-center">
                <div className={styles.notification_box}>
                    <Heading size="3">
                        Please use Safe Exam Browser to take exam
                    </Heading>
                </div>
            </Wrapper>
        );
    }

    // Loading when fetch API
    if (loading || postAnswerResult.loading) {
        return <Loading />;
    }

    return (
        <>
            <div id="ExamPage" className="overflow-auto ">
                <ExamHeader
                    examId={examId}
                    result={data}
                    submitAnswer={submitAnswer}
                />

                <NumberQuestionModal>
                    {data?.questionAnswer.map((number, index) => {
                        //boolean check nếu examQuestionId nằm trong list answer
                        let isDone = listAnswer.some(
                            (r) => r.examQuestionId === number.examQuestionId
                        );
                        let toBeReView = reviewQuestion.some(
                            (r) => r === number.examQuestionId
                        );
                        let currentQuestion = question + 1 === index + 1;

                        return (
                            <NumberQuestion
                                key={index}
                                number={index + 1}
                                onClick={() => {
                                    addEssayAnswerToList(
                                        essayAnswer,
                                        data?.questionAnswer[question]
                                            .examQuestionId
                                    );
                                    setQuestion(index);
                                }}
                                color={
                                    currentQuestion
                                        ? "#000000"
                                        : toBeReView
                                        ? "var(--color-blue)"
                                        : isDone
                                        ? "#7AE765"
                                        : "var(--color-gray)"
                                }
                            />
                        );
                    })}
                </NumberQuestionModal>
                <div className={`d-md-flex ${styles.wrapper}`}>
                    <div
                        className={`d-none d-md-block ${styles.questionBlock}`}
                    >
                        {data?.questionAnswer.map((number, index) => {
                            //boolean check nếu examQuestionId nằm trong list answer
                            let isDone = listAnswer.some(
                                (r) =>
                                    r.examQuestionId === number.examQuestionId
                            );
                            //boolean check nếu examQuestionId nằm trong list review question
                            let toBeReView = reviewQuestion.some(
                                (r) => r === number.examQuestionId
                            );
                            //boolean check nếu question hiện tại là question đang hiển thị
                            let currentQuestion = question + 1 === index + 1;

                            return (
                                <NumberQuestion
                                    key={index}
                                    number={index + 1}
                                    onClick={() => {
                                        addEssayAnswerToList(
                                            essayAnswer,
                                            data?.questionAnswer[question]
                                                .examQuestionId
                                        );
                                        setQuestion(index);
                                    }}
                                    color={
                                        currentQuestion
                                            ? "#000000"
                                            : toBeReView
                                            ? "var(--color-blue)"
                                            : isDone
                                            ? "#7AE765"
                                            : "var(--color-gray)"
                                    }
                                />
                            );
                        })}
                        <div>
                            <Icon
                                icon="circle"
                                className="me-2 ms-2"
                                style={{ color: "#7AE765" }}
                            ></Icon>
                            Attempted
                        </div>
                        <div>
                            <Icon
                                icon="circle"
                                className="me-2 ms-2"
                                style={{ color: "var(--color-blue)" }}
                            ></Icon>
                            To be review
                        </div>
                    </div>
                    <div className={styles.page_container}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                showModalConfirmSubmit();
                            }}
                        >
                            <div className={`${styles.exam_question}`}>
                                <div style={{ color: "var(--color-gray)" }}>
                                    <b>Question {question + 1}</b>
                                </div>
                                <p>
                                    {
                                        data?.questionAnswer[question]
                                            .questionContent
                                    }
                                </p>
                                {/* Image of question */}
                                {data?.questionAnswer[question]
                                    .questionImageURL && ( //Check if image url is null, don't render image
                                    <img
                                        id={`${styles.imgQuestion}`}
                                        src={
                                            data?.questionAnswer[question]
                                                .questionImageURL
                                        }
                                        alt="L0-5-1"
                                        border="0"
                                    />
                                )}
                                {/* Horizontal line */}
                                <div
                                    className={`${styles.horizontal_line} mb-2`}
                                ></div>
                                {/* Answer option */}
                                <div>
                                    {data?.questionAnswer[question].answers
                                        .length > 1 ? (
                                        data?.questionAnswer[
                                            question
                                        ].answers.map((answer) => (
                                            <div
                                                className={`${styles.answer_option}`}
                                                key={answer.answerId}
                                            >
                                                <input
                                                    className="ms-2"
                                                    type="radio"
                                                    id={answer.answerId}
                                                    checked={listAnswer
                                                        .map(
                                                            (a) =>
                                                                a.studentAnswerContent
                                                        )
                                                        .includes(
                                                            String(
                                                                answer.answerId
                                                            ) // Check answer if answer in included in listAnswer
                                                        )}
                                                    onChange={() => {
                                                        setAnswerChecked(
                                                            answer.answerId
                                                        );
                                                        addAnswerToList(
                                                            answer.answerId,
                                                            data
                                                                ?.questionAnswer[
                                                                question
                                                            ].examQuestionId
                                                        );
                                                        // changeBackGroundQuestionNumber();
                                                    }}
                                                    value={answer.id}
                                                />
                                                <label
                                                    className="ms-2"
                                                    htmlFor={answer.answerId}
                                                >
                                                    {answer.answerContent}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <textarea
                                            defaultValue={
                                                listAnswer.filter(
                                                    (r) =>
                                                        r.examQuestionId ===
                                                        data?.questionAnswer[
                                                            question
                                                        ].examQuestionId
                                                )[0]?.studentAnswerContent
                                            }
                                            name="answer"
                                            cols={
                                                window.innerWidth < 1180
                                                    ? "84"
                                                    : "135"
                                            }
                                            rows="16"
                                            onChange={(e) =>
                                                setEssayAnswer(e.target.value)
                                            }
                                        ></textarea>
                                    )}
                                </div>
                            </div>

                            <footer
                                className={`d-md-flex justify-content-md-between mt-3`}
                            >
                                <div className="d-flex justify-content-between">
                                    {/* Button for previous question */}
                                    <button
                                        type="button"
                                        disabled={question === 0} //If question is the first one
                                        className={`btn shadow-light ${styles.btn_gray} ${styles.exam_btn}`}
                                        onClick={() => {
                                            addEssayAnswerToList(
                                                essayAnswer,
                                                data?.questionAnswer[question]
                                                    .examQuestionId
                                            );
                                            setQuestion(question - 1);
                                        }}
                                    >
                                        <Icon
                                            icon="arrow-circle-left"
                                            className="me-2"
                                        ></Icon>
                                        Previous
                                    </button>
                                    {/* Button for next question */}
                                    <button
                                        type="button"
                                        disabled={
                                            question ===
                                            data?.questionAnswer.length - 1
                                        } //if question is the last one
                                        className={`btn shadow-light ${styles.btn_gray} ${styles.exam_btn}`}
                                        onClick={() => {
                                            addEssayAnswerToList(
                                                essayAnswer,
                                                data?.questionAnswer[question]
                                                    .examQuestionId
                                            );
                                            setQuestion(question + 1);
                                        }}
                                    >
                                        Next
                                        <Icon
                                            icon="arrow-circle-right"
                                            className="ms-2"
                                        ></Icon>
                                    </button>
                                </div>

                                <div
                                    className={`d-md-flex justify-content-md-between text-center`}
                                >
                                    <div>
                                        {/* Button for review later */}
                                        <button
                                            type="button"
                                            className={`btn shadow-light ${styles.btn_gray} ${styles.exam_btn}`}
                                            onClick={() =>
                                                addToReviewLaterList(
                                                    data?.questionAnswer[
                                                        question
                                                    ].examQuestionId
                                                )
                                            }
                                        >
                                            Review later
                                        </button>
                                    </div>
                                    <div>
                                        {/* Finish button */}
                                        <button
                                            type="submit"
                                            className={`btn ${styles.btn_finish}`}
                                            onClick={() => {
                                                addEssayAnswerToList(
                                                    essayAnswer,
                                                    data?.questionAnswer[
                                                        question
                                                    ].examQuestionId
                                                );
                                            }}
                                        >
                                            Finish
                                        </button>
                                    </div>
                                </div>
                            </footer>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
export default Exam;
