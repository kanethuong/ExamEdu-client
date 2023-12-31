import Button from "components/Button";
import Icon from "components/Icon";
import OurModal from "components/OurModal";
import Pagination from "components/Pagination";
import SearchBar from "components/SearchBar";
import Table from "components/Table";
import Wrapper from "components/Wrapper";
import React from "react";
import styles from "../../styles/ModuleList.module.css";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { API, REQUIRED } from "utilities/constants";
import { useLazyFetch } from "utilities/useFetch";
import useOutsideClick from "utilities/useOutsideClick";
import { useWindowSize } from "utilities/useWindowSize";
import InputBox from "components/InputBox";
import Heading from "components/Heading";
import { useForm } from "utilities/useForm";
import Swal from "sweetalert2";
import Loading from "pages/Loading";
import moment from "moment";

const ModuleList = () => {
    const [keyword, setKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const windowSize = useWindowSize();

    const [fetchData, fetchDataResult] = useLazyFetch(
        `${API}/module?pageNumber=${currentPage}&pageSize=${pageSize}&searchName=${keyword}`
    );

    //Use form for create
    const createForm = useForm(fields, handleCreate);
    const updateForm = useForm(fields, handleUpdate);

    //useLazyFetch for Create and Update
    const [postData, postDataResult] = useLazyFetch(`${API}/module`, {
        method: "POST",
        body: {
            moduleCode: createForm.values.moduleCode,
            moduleName: createForm.values.moduleName
        },
        onCompletes: () => {
            Swal.fire("Success", "Module created", "success");
            fetchData();
        },
        onError: (error) => {
            Swal.fire("Error", error.message, "error");
        }
    });

    //Handle creating new modules
    function handleCreate() {
        //Confirm before Creating
        Swal.fire({
            title: "Are you sure?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes"
        }).then((result) => {
            if (result.isConfirmed) {
                postData();
            }
        });
    }

    //Handle Updating modules
    function handleUpdate() {
        //Confirm before updating
        Swal.fire({
            title: "Are you sure?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes"
        }).then((result) => {
            if (result.isConfirmed) {
                //Submit the update
                postData(`${API}/module`, {
                    method: "PUT",
                    body: {
                        moduleCode: updateForm.values.moduleCode,
                        moduleName: updateForm.values.moduleName
                    },
                    onCompletes: () => {
                        Swal.fire("Success", "Module Updated", "success");
                        fetchData();
                    },
                    onError: (error) => {
                        Swal.fire("Error", error.message, "error");
                    }
                });
            }
        });
    }

    //Using ourModal for create form
    const modalRef = useRef(null);
    const { isClicked, setIsClicked } = useOutsideClick(modalRef);

    //Using ourModal for update form
    const updateRef = useRef(null);
    const updateModal = useOutsideClick(updateRef);

    function handleToggleModal() {
        setIsClicked(true);
    }
    function handleSearch() {
        fetchData();
    }

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const columns = [
        "ID",
        "Module Code",
        "Module Name",
        "Created At",
        windowSize.width > 768 ? "Actions" : ""
    ];

    if (fetchDataResult.loading || postDataResult.loading) {
        return <Loading />;
    }

    return (
        <>
            {/* Create module form */}
            <OurModal
                modalRef={modalRef}
                isClicked={isClicked}
                setIsClicked={setIsClicked}
                modalClassName={styles.modal}
            >
                {/* 3 dots */}
                <Icon icon="ellipsis-h" size="2x"></Icon>
                {/* Modal content */}
                <div className={styles.modal_content_container}>
                    <form
                        className={styles.content}
                        onSubmit={createForm.onSubmit}
                    >
                        {/* Title */}
                        <Heading size="3" className="text-center mb-3 mb-md-3">
                            Create Module
                        </Heading>
                        {/* Module Code */}
                        <small>
                            Warning: You can not change a module's code nor can
                            you delete a module after creating a module.
                        </small>
                        <InputBox
                            label={"Module Code"}
                            name={"moduleCode"}
                            value={createForm.values.moduleCode}
                            onChange={createForm.onChange}
                            errorMessage={createForm.errors.moduleCode}
                            className={`mb-3 mb-md-4 ${styles.input_box}`}
                        />
                        {/* Module Name */}
                        <InputBox
                            label="Module Name"
                            name="moduleName"
                            value={createForm.values.moduleName}
                            onChange={createForm.onChange}
                            errorMessage={createForm.errors.moduleName}
                            className={`mb-3 mb-md-4 ${styles.input_box}`}
                        />
                        <div className="w-100">
                            <Button
                                type="submit"
                                style={{
                                    width: "100%",
                                    height: "2.5rem",
                                    borderRadius: "20px",
                                    fontSize: "1.2rem",
                                    fontWeight: "bold"
                                }}
                            >
                                <Icon icon="save" className="me-2" />
                                Confirm
                            </Button>
                        </div>
                    </form>
                </div>
            </OurModal>
            {/* Update module form */}
            <OurModal
                modalRef={updateRef}
                isClicked={updateModal.isClicked}
                setIsClicked={updateModal.setIsClicked}
                modalClassName={styles.modal}
            >
                {/* 3 dots */}
                <Icon icon="ellipsis-h"></Icon>
                {/* Modal content */}
                <div className={styles.modal_content_container}>
                    <form
                        className={styles.content}
                        onSubmit={updateForm.onSubmit}
                    >
                        {/* Title */}
                        <Heading size="3" className="text-center mb-3 mb-md-4">
                            Update Module
                        </Heading>
                        {/* Module Code */}
                        <InputBox
                            label={"Module Code"}
                            name={"moduleCode"}
                            value={updateForm.values.moduleCode}
                            onChange={updateForm.onChange}
                            errorMessage={updateForm.errors.moduleCode}
                            className={`mb-3 mb-md-4 ${styles.input_box}`}
                            disabled={true}
                        />
                        {/* Module Name */}
                        <InputBox
                            label="Module Name"
                            name="moduleName"
                            value={updateForm.values.moduleName}
                            onChange={updateForm.onChange}
                            errorMessage={updateForm.errors.moduleName}
                            className={`mb-3 mb-md-4 ${styles.input_box}`}
                        />
                        <div className="w-100">
                            <Button
                                type="submit"
                                style={{
                                    width: "100%",
                                    height: "2.5rem",
                                    borderRadius: "10px",
                                    fontSize: "1.2rem",
                                    fontWeight: "bold"
                                }}
                            >
                                <Icon icon="save" className="me-2" />
                                Confirm
                            </Button>
                        </div>
                    </form>
                </div>
            </OurModal>
            <Wrapper>
                <SearchBar
                    pageName={"Module List"}
                    keyWord={keyword}
                    setKeyWord={setKeyword}
                    onAddButtonClick={handleToggleModal}
                    onSubmit={handleSearch}
                    placeholder={"Search by module code or module name"}
                    toolTipTitle={"Add new module"}
                ></SearchBar>
                <Table
                    columns={columns}
                    data={fetchDataResult.data?.payload.map((module) => ({
                        id: module.moduleId,
                        moduleCode: module.moduleCode,
                        moduleName: module.moduleName,
                        createdAt: moment(module.createdAt).format(
                            "HH:MM DD/MM/YYYY"
                        ),
                        action: (
                            <div
                                className={
                                    "d-flex justify-content-end justify-content-lg-center align-items-center"
                                }
                            >
                                {/* Edit Button */}
                                <Button
                                    circle={true}
                                    style={{
                                        backgroundColor: "var(--nav-bar)",
                                        color: "#00FF2B"
                                    }}
                                    className="me-2"
                                    onClick={() => {
                                        updateForm.setValues({
                                            moduleCode: module.moduleCode,
                                            moduleName: module.moduleName
                                        });

                                        updateModal.setIsClicked(true);
                                    }}
                                    titleTooltip={"Edit module"}
                                >
                                    <Icon icon="edit" />
                                </Button>
                            </div>
                        )
                    }))}
                ></Table>
                <Pagination
                    totalRecords={fetchDataResult.data?.totalRecords}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    pageSize={pageSize}
                />
            </Wrapper>
        </>
    );
};

export default ModuleList;

const fields = {
    moduleCode: {
        validate: REQUIRED,
        message: "Please input the module code"
    },
    moduleName: {
        validate: REQUIRED,
        message: "Please input the module name"
    }
};
