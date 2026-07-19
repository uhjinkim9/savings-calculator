"use client";
import styles from "./styles/AddPoll.module.scss";
import {ChangeEvent, useEffect} from "react";
import {usePathname, useRouter} from "next/navigation";
import clsx from "clsx";
import useModal from "@/hooks/useModal";

import {
	checkIsSelectableType,
	PollType,
	QuestionType,
	SelectionType,
} from "@/types/poll.type";
import {usePollContext} from "@/context/PollContext";
import {requestPost} from "@/util/api/api-service";
import {responseTypeMap} from "./QuestionNodes";
import {validatePoll} from "./etc/validate";
import AlertService from "@/services/alert.service";

import InputTextArea from "@/components/common/form-properties/InputTextArea";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";
import SelectBox from "@/components/common/form-properties/SelectBox";
import Button from "@/components/common/form-properties/Button";
import Toggle from "@/components/common/form-properties/Toggle";
import Divider from "@/components/common/segment/Divider";
import TextEditor from "@/components/common/editor/TextEditor";
import Modal from "@/components/common/layout/Modal";
import SortableList from "@/components/common/layout/SortableList";
import PreviewPoll from "./PreviewPoll";
import InputBasic from "@/components/common/form-properties/InputBasic";
import UserDirectorySelect from "@/components/common/user-directory/UserDirectorySelect";
import DateTimeRangePicker from "@/components/common/form-properties/DateTimeRangePicker";
import IconNode from "@/components/common/segment/IconNode";

export default function AddPoll() {
	const {state, dispatch} = usePollContext();
	const {mode, selected, poll} = state;
	const {openModal, closeModal, modalConfig} = useModal();

	const router = useRouter();
	const pathname = usePathname();
	const pathSegs = pathname.split("/");
	const [_, mainMenu, subMenu] = pathSegs; // mainMenu: community

	useEffect(() => {
		console.log("state.poll", state.poll);
	}, [state.poll]);

	function onChangePoll(
		e: ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
		ids: {
			pollTempId?: string;
			pollIdx?: number;
		}
	) {
		const {name, value} = e.target;

		let val;
		if (name === "orgSelected") {
			// UserDirectorySelect에서 이미 문자열로 합쳐진 값을 받음
			const org = value as unknown as {
				userIds: string[];
				deptCds: string[];
				joinUserId: string;
				joinDeptCd: string;
			};

			// joinUserId 업데이트
			if (org.joinUserId) {
				dispatch({
					type: "UPDATE_POLL_FIELD",
					payload: {
						pollTempId: ids.pollTempId || undefined,
						pollIdx: ids.pollIdx || undefined,
						name: "joinUserId" as keyof PollType,
						value: org.joinUserId,
					},
				});
			}

			// joinDeptCd 업데이트
			if (org.joinDeptCd) {
				dispatch({
					type: "UPDATE_POLL_FIELD",
					payload: {
						pollTempId: ids.pollTempId || undefined,
						pollIdx: ids.pollIdx || undefined,
						name: "joinDeptCd" as keyof PollType,
						value: org.joinDeptCd,
					},
				});
			}

			// 여기서 끝내야 아래 기본 디스패치 안 탐
			return;
		} else {
			val = value;
		}

		// 기본 디스패치
		dispatch({
			type: "UPDATE_POLL_FIELD",
			payload: {
				pollTempId: ids.pollTempId || undefined,
				pollIdx: ids.pollIdx || undefined,
				name: name as keyof PollType,
				value: val,
			},
		});
	}

	function onChangeQuestion(
		e: ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
		ids: {
			questionTempId?: string;
			questionIdx?: number;
		}
	) {
		const {name, value} = e.target;
		const payload = {
			questionTempId: ids.questionTempId || undefined,
			questionIdx: ids.questionIdx || undefined,
		};

		if (name === "responseType") {
			dispatch({
				type: "RESET_QUESTION",
				payload,
			});
		}
		dispatch({
			type: "UPDATE_QUESTION_FIELD",
			payload: {
				...payload,
				name: name as keyof QuestionType,
				value: value,
			},
		});
	}

	function onChangeSelection(
		e: ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
		ids: {
			questionTempId?: string;
			questionIdx?: number;
			selectionTempId?: string;
			selectionIdx?: number;
		}
	) {
		const {name, value} = e.target;
		const payload = {
			questionTempId: ids.questionTempId || undefined,
			questionIdx: ids.questionIdx || undefined,
			selectionTempId: ids.selectionTempId || undefined,
			selectionIdx: ids.selectionIdx || undefined,
			name: name as keyof SelectionType,
			value,
		};

		dispatch({
			type: "UPDATE_SELECTION_FIELD",
			payload,
		});
	}

	function onClickAddSelection(
		questionTempId?: string,
		questionIdx?: number
	) {
		dispatch({
			type: "ADD_SELECTION",
			payload: {
				questionTempId: questionTempId || undefined,
				questionIdx: questionIdx || undefined,
			},
		});
	}

	function onClickAddQuestion(pollTempId?: string, pollIdx?: number) {
		dispatch({
			type: "ADD_QUESTION",
			payload: {
				pollTempId: pollTempId || undefined,
				pollIdx: pollIdx || undefined,
			},
		});
	}

	function onDeleteQorS(
		qOrS: string,
		ids: {
			questionTempId?: string;
			questionIdx?: number;
			selectionTempId?: string;
			selectionIdx?: number;
		}
	) {
		if (qOrS === "s") {
			dispatch({
				type: "DELETE_SELECTION",
				payload: {
					questionTempId: ids.questionTempId || undefined,
					questionIdx: ids.questionIdx || undefined,
					selectionTempId: ids.selectionTempId || undefined,
					selectionIdx: ids.selectionIdx || undefined,
				},
			});
		} else {
			dispatch({
				type: "DELETE_QUESTION",
				payload: {
					questionTempId: ids.questionTempId || undefined,
					questionIdx: ids.questionIdx || undefined,
				},
			});
		}
	}

	async function createOrUpdatePoll() {
		const validationCheck = validatePoll(poll);
		if (!validationCheck) return;

		const res = await requestPost("/poll/createOrUpdatePoll", state);
		if (res.statusCode === 200) {
			AlertService.success("설문이 저장되었습니다.");
			const url = `/${mainMenu}/${subMenu}`;
			router.push(url);
			dispatch({type: "RESET"});
		}
	}

	async function onCancel() {
		router.push("./");
	}

	async function getPollDetail() {
		const res = await requestPost("/poll/getPollDetail", {
			pollIdx: selected,
		});
		if (res.statusCode === 200) {
			const detail = res.data;
			const joinUserIdArr = [
				...new Set(detail.respondents.map((resp: any) => resp.empNo)),
			];
			const joinUserIdStr = joinUserIdArr.join(",");

			const joinDeptCdArr = [
				...new Set(detail.respondents.map((resp: any) => resp.deptCd)),
			];
			const joinDeptCdStr = joinDeptCdArr.join(",");

			dispatch({
				type: "SET_POLL",
				payload: {
					...detail,
					joinUserId: joinUserIdStr,
					joinDeptCd: joinDeptCdStr,
				},
			});
		}
	}

	useEffect(() => {
		if (mode === "edit") getPollDetail();
	}, [selected]);

	function onClickPreview() {
		openModal();
	}

	return (
		<div className={styles.componentContainer}>
			<div className={styles.iconRow}>
				<IconNode iconName="textCursor" size={18} color="gray5" />
				<InputBasic
					type="text"
					onChange={(e: ChangeEvent<HTMLInputElement>) =>
						onChangePoll(e, {
							pollTempId: poll?.pollTempId,
							pollIdx: poll?.pollIdx,
						})
					}
					name="title"
					value={poll?.title}
					width="90%"
					allowNegative
					placeholder="제목을 입력하세요"
					readOnly={mode === "edit"}
				></InputBasic>
			</div>
			<Divider type="middle" look="dashed" />

			<div className={clsx(styles.row, styles.pollInfo)}>
				<div className={styles.iconRow}>
					<IconNode iconName="clock" size={18} color="gray5" />
					<DateTimeRangePicker
						startedAt={poll?.startedAt}
						endedAt={poll?.endedAt}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							onChangePoll?.(e, {
								pollTempId: poll?.pollTempId,
								pollIdx: poll?.pollIdx,
							})
						}
						isDateOnly
					></DateTimeRangePicker>
				</div>
				<div className={styles.inRowGroup}>
					<Toggle
						label="결과 공개"
						name="revealResult"
						value={poll?.revealResult ?? false}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							onChangePoll?.(e, {
								pollTempId: poll?.pollTempId,
								pollIdx: poll?.pollIdx,
							})
						}
					/>
					<Toggle
						label="참여 후 수정 허용"
						name="modifyAfterAnswered"
						value={poll?.modifyAfterAnswered ?? false}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							onChangePoll?.(e, {
								pollTempId: poll?.pollTempId,
								pollIdx: poll?.pollIdx,
							})
						}
					/>
					<Toggle
						label="익명 답변"
						name="isAnonymous"
						value={poll?.isAnonymous ?? false}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							onChangePoll?.(e, {
								pollTempId: poll?.pollTempId,
								pollIdx: poll?.pollIdx,
							})
						}
					/>
				</div>
			</div>

			<div className={styles.row}>
				<div className={styles.iconRow}>
					<IconNode iconName="user" size={18} color="gray5" />
					<UserDirectorySelect
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							onChangePoll?.(e, {
								pollTempId: poll?.pollTempId,
								pollIdx: poll?.pollIdx,
							})
						}
						multi
						buttonLabel="선택"
						inputLabel="대상"
						name="orgSelected"
						value={{
							joinUserId: poll?.joinUserId,
							joinDeptCd: poll?.joinDeptCd,
						}}
					></UserDirectorySelect>
				</div>
			</div>
			<Divider type="none" />

			<TextEditor
				name="explanation"
				value={poll?.explanation}
				onChange={(e: ChangeEvent<any>) =>
					onChangePoll(e, {
						pollTempId: poll?.pollTempId,
						pollIdx: poll?.pollIdx,
					})
				}
				etc={{mode: mode}}
			/>
			<Divider type="none" />

			<SortableList
				items={poll?.questions ?? []}
				getId={(q: QuestionType) =>
					q.questionTempId || String(q.questionIdx)
				}
				droppableId="poll-questions"
				onChange={(reordered: any) =>
					dispatch({
						type: "REORDER_QUESTIONS",
						payload: reordered.map((q: any, idx: any) => ({
							...q,
							order: idx + 1,
						})),
					})
				}
				renderItem={(question, qIdx, dragHandleProps) => (
					<div
						key={question.questionTempId || question.questionIdx}
						className={styles.questionNodes}
					>
						<div
							className={clsx(styles.row, styles.questionOptions)}
						>
							<div className={styles.iconRow}>
								<SelectBox
									componentType="smallGray"
									name="responseType"
									value={question?.responseType}
									onChange={(e) =>
										onChangeQuestion(e, {
											questionTempId:
												question?.questionTempId,
											questionIdx: question?.questionIdx,
										})
									}
									defaultLabel="응답 유형"
									codeClass="poll-response-type"
								/>
								<Toggle
									label="필수 응답"
									name="isRequired"
									value={!!question?.isRequired}
									onChange={(e) =>
										onChangeQuestion(e, {
											questionTempId:
												question?.questionTempId,
											questionIdx: question?.questionIdx,
										})
									}
								/>
							</div>

							{/* 질문 삭제 버튼 */}
							<span
								className={styles.deleteSel}
								onClick={() =>
									onDeleteQorS("q", {
										questionTempId:
											question?.questionTempId,
										questionIdx: question?.questionIdx,
									})
								}
							>
								<IconNode
									iconName="cross"
									size={14}
									color="gray4"
								/>
							</span>
						</div>

						<div className={clsx("row", styles.questionContent)}>
							{question?.isRequired === 1 && (
								<span className={styles.required}>*</span>
							)}
							<div
								className={styles.dragHandle}
								{...dragHandleProps}
							>
								<IconNode
									iconName="dragHandle"
									size={16}
									color="gray4"
								/>
							</div>
							<InputTextArea
								placeholder={`${question?.order}. 질문 내용`}
								name="question"
								value={question?.question}
								onChange={(e: any) =>
									onChangeQuestion(e, {
										questionTempId:
											question?.questionTempId,
										questionIdx: question?.questionIdx,
									})
								}
							/>
						</div>

						{/* 보기 */}
						<SortableList
							items={question.selections ?? []}
							getId={(s) =>
								s.selectionTempId || String(s.selectionIdx)
							}
							droppableId={`poll-selections-${
								question.questionTempId || question.questionIdx
							}`}
							onChange={(reordered) =>
								dispatch({
									type: "REORDER_SELECTIONS",
									payload: {
										questionTempId: question.questionTempId,
										questionIdx: question.questionIdx,
										selections: reordered.map(
											(sel, idx) => ({
												...sel,
												order: idx + 1,
											})
										),
									},
								})
							}
							renderItem={(
								selection,
								selIdx,
								dragHandleProps
							) => (
								<div
									key={
										selection.selectionTempId ||
										selection.selectionIdx
									}
									className={clsx(
										styles.row,
										styles.selectionsAdded
									)}
								>
									{checkIsSelectableType(
										question.responseType
									) && (
										<div
											className={styles.dragHandle}
											{...(checkIsSelectableType(
												question.responseType
											)
												? dragHandleProps
												: {})}
										>
											<IconNode
												iconName="dragHandle"
												size={14}
												color="gray4"
											/>
										</div>
									)}

									{question?.responseType &&
										responseTypeMap[question.responseType]({
											name: "selection",
											value: selection?.selection || "",
											onChange: (e) =>
												onChangeSelection(e, {
													questionTempId:
														question.questionTempId,
													questionIdx:
														question.questionIdx,
													selectionTempId:
														selection.selectionTempId,
													selectionIdx:
														selection.selectionIdx,
												}),
										})}

									{checkIsSelectableType(
										question.responseType
									) && (
										<span
											className={styles.deleteSel}
											onClick={() =>
												onDeleteQorS("s", {
													questionTempId:
														question.questionTempId,
													questionIdx:
														question.questionIdx,
													selectionTempId:
														selection.selectionTempId,
													selectionIdx:
														selection.selectionIdx,
												})
											}
										>
											<IconNode
												iconName="cross"
												size={12}
												color="gray4"
											/>
										</span>
									)}
								</div>
							)}
						/>

						{checkIsSelectableType(question.responseType) && (
							<div className={clsx("row", styles.selAddBtn)}>
								<Button
									onClick={() =>
										onClickAddSelection(
											question.questionTempId ||
												undefined,
											question.questionIdx || undefined
										)
									}
									componentType="smallGray"
									onHoverOpaque
									width="110px"
								>
									＋ 항목 추가
								</Button>
							</div>
						)}
					</div>
				)}
			/>

			{(mode === "add" || mode === "edit") && (
				<Button
					onClick={() =>
						onClickAddQuestion(poll?.pollTempId, poll?.pollIdx)
					}
					width="100%"
					onHoverOpaque
					componentType="bigGray"
				>
					＋ 질문 추가
				</Button>
			)}

			<Divider type="none" />

			<CommonButtonGroup
				usedButtons={{
					btnSubmit: true,
					btnCancel: true,
					btnTempSave: true,
					btnPreview: true,
				}}
				onSubmit={createOrUpdatePoll}
				onCancel={onCancel}
				onShowPreview={onClickPreview}
			></CommonButtonGroup>

			<Modal
				closeModal={closeModal}
				modalConfig={modalConfig}
				width="80vw"
				height="80vh"
			>
				<PreviewPoll poll={poll}></PreviewPoll>
			</Modal>
		</div>
	);
}
