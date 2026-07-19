"use client";
import {useEffect, useState, useCallback, memo} from "react";
import {requestPost} from "@/util/api/api-service";
import {
  EmpPolicyGroupType,
  GroupUserMappingType,
} from "@/types/attendance.type";
import {ModeType} from "@/types/common.type";

import styles from "../styles/AdminAttendanceUser.module.scss";
import clsx from "clsx";
import AlertService from "@/services/alert.service";
import PolicyGroupListLine from "../inner/PolicyGroupListLine";
import IconNode from "@/components/common/segment/IconNode";
import CheckBox from "@/components/common/form-properties/CheckBox";
import ButtonBasic from "@/components/common/form-properties/ButtonBasic";
import InputBasic from "@/components/common/form-properties/InputBasic";
import Divider from "@/components/common/segment/Divider";
import useModal from "@/hooks/useModal";
import Modal from "@/components/common/layout/Modal";
import UserDirectorySelect from "@/components/common/user-directory/UserDirectorySelect";
import CommonButtonGroup from "@/components/common/segment/CommonButtonGroup";

const ListHeader = memo(
  ({
    onSelectAll,
    isAllSelected,
  }: {
    onSelectAll?: () => void;
    isAllSelected?: boolean;
  }) => (
    <div className={clsx(styles.lineWrapper, styles.headerRow)}>
      <div className={styles.check}>
        <CheckBox
          componentType="orange"
          value={isAllSelected}
          onChange={onSelectAll}
        />
      </div>
      <div className={styles.groupNm}>그룹명</div>
      <div className={styles.editBtn}>수정</div>
      <div className={styles.mapping}>적용 정책</div>
    </div>
  ),
);

// 개별 그룹 행 컴포넌트 (성능 최적화용)
const GroupRowComponent = memo(
  ({
    pg,
    groupIdx,
    isSelected,
    mode,
    setMode,
    editingGroupIdx,
    selectedGroups,
    onClickEdit,
    onCheck,
    onChangeEditingGroup,
    handleKeyDown,
    handleSaveEdit,
    handleGroupSelect,
  }: {
    pg: EmpPolicyGroupType;
    groupIdx: number;
    isSelected: boolean;
    mode: ModeType;
    setMode: (mode: ModeType) => void;
    editingGroupIdx: number | null;
    selectedGroups: Set<number>;
    onClickEdit: (groupIdx: number) => void;
    onCheck: (groupIdx: number) => void;
    onChangeEditingGroup: (e: React.ChangeEvent<any>, groupIdx: number) => void;
    handleKeyDown: (
      e: React.KeyboardEvent<HTMLInputElement>,
      groupIdx: number,
    ) => void;
    handleSaveEdit: (groupIdx: number) => void;
    handleGroupSelect: (groupIdx: number) => void;
  }) => (
    <div
      className={clsx(styles.groupRow, isSelected && styles.selectedRow)}
      onClick={() => handleGroupSelect(groupIdx)}
    >
      <PolicyGroupListLine
        onClickEdit={() => onClickEdit(groupIdx)}
        data={pg}
        mode={mode}
        setMode={setMode}
        isEditingThis={editingGroupIdx === pg.groupIdx}
        isSelected={selectedGroups.has(groupIdx)}
        onCheck={() => onCheck(groupIdx)}
        onChangeEditing={(e: React.ChangeEvent<any>) =>
          onChangeEditingGroup(e, groupIdx)
        }
        handleKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
          handleKeyDown(e, groupIdx)
        }
        handleSaveEdit={() => handleSaveEdit(groupIdx)}
      />
    </div>
  ),
);

ListHeader.displayName = "ListHeader";
GroupRowComponent.displayName = "GroupRowComponent";

export default function AdminAttendanceUser() {
  // 그룹 관리 상태
  const [policyGroups, setPolicyGroups] = useState<EmpPolicyGroupType[] | null>(
    null,
  );
  const [mode, setMode] = useState<ModeType>("view");
  const [editingGroupIdx, setEditingGroupIdx] = useState<number | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<Set<number>>(new Set());

  // 선택된 그룹과 해당 그룹의 유저들
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<number | null>(null);
  const [groupUsers, setGroupUsers] = useState<GroupUserMappingType[] | null>(
    null,
  );
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [editingUserMode, setEditingUserMode] = useState<ModeType>("view");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedUsersForAdd, setSelectedUsersForAdd] = useState<{
    userIds: string[];
    deptCds: string[];
  }>({userIds: [], deptCds: []});

  const {openModal, closeModal, modalConfig} = useModal();

  const onChangeEditingGroup = useCallback(
    (e: React.ChangeEvent<any>, groupIdx: number) => {
      const {name, value} = e.target;

      setPolicyGroups((prev) => {
        if (!prev) return [];

        // 해당 그룹의 인덱스 찾기
        const targetIndex = prev.findIndex(
          (policy) => policy.groupIdx === groupIdx,
        );
        if (targetIndex === -1) return prev;

        // 해당 그룹만 업데이트 (shallow copy 최적화)
        const newPolicyGroups = [...prev];
        newPolicyGroups[targetIndex] = {
          ...newPolicyGroups[targetIndex],
          [name]: value,
        };

        return newPolicyGroups;
      });
    },
    [],
  );

  const getPolicyGroups = async () => {
    const res = await requestPost("/attendance/getPolicyGroups");
    if (res.statusCode === 200) {
      AlertService.success(res.message);
      console.log("응답 성공 데이터:", res.data);
      setPolicyGroups(res.data);
    }
  };

  // 선택된 그룹의 유저 목록 가져오기
  const getGroupUsers = async (groupIdx: number) => {
    const res = await requestPost("/attendance/getGroupUserMappings", {
      groupIdx,
    });
    if (res.statusCode === 200) {
      setGroupUsers(res.data);
      setSelectedUsers(new Set()); // 유저 선택 초기화
    }
  };

  // 그룹 선택 핸들러
  const handleGroupSelect = useCallback((groupIdx: number) => {
    setSelectedGroupIdx(groupIdx);
    getGroupUsers(groupIdx);
  }, []);

  useEffect(() => {
    getPolicyGroups();
  }, []);

  const addGroup = async () => {
    try {
      const requestData = {
        groupNm: "새 그룹",
      };

      const res = await requestPost(
        "/attendance/insertPolicyGroup",
        requestData,
      );

      if (res.statusCode === 200) {
        AlertService.success(res.message);
        setPolicyGroups((prev) => (prev ? [...prev, res.data] : [res.data]));
      } else {
        AlertService.error(
          `그룹 생성에 실패했습니다: ${res.message || "알 수 없는 오류"}`,
        );
      }
    } catch (error) {
      console.error("addGroup 에러:", error);
      AlertService.error("그룹 생성 중 오류가 발생했습니다.");
    }
  };

  const onClickEdit = useCallback((groupIdx: number) => {
    setMode("edit");
    setEditingGroupIdx(groupIdx);
  }, []);

  const handleSaveEdit = useCallback(
    async (groupIdx: number) => {
      try {
        const editingGroup = policyGroups?.find((p) => p.groupIdx === groupIdx);
        if (!editingGroup) return;

        const requestData = {
          groupId: groupIdx,
          ...editingGroup,
        };
        const res = await requestPost(
          "/attendance/updatePolicyGroup",
          requestData,
        );

        if (res.statusCode === 200) {
          AlertService.success(res.message);
          setMode("view");
          setEditingGroupIdx(null);
        } else {
          AlertService.error(
            `정책 변경에 실패했습니다: ${res.message || "알 수 없는 오류"}`,
          );
        }
      } catch (error) {
        console.error("handleSaveEdit 에러:", error);
        AlertService.error("정책 변경 중 오류가 발생했습니다.");
      }
    },
    [policyGroups],
  );

  const handleCancelEdit = useCallback(() => {
    setMode("view");
    setEditingGroupIdx(null);
    // 원래 데이터로 되돌리기 위해 다시 fetch
    getPolicyGroups();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, groupIdx: number) => {
      if (e.key === "Enter") {
        handleSaveEdit(groupIdx);
      } else if (e.key === "Escape") {
        handleCancelEdit();
      }
    },
    [handleSaveEdit, handleCancelEdit],
  );

  const handleSelectAll = useCallback(() => {
    if (!policyGroups) return;

    const allIds = policyGroups
      .map((group) => group.groupIdx || 0)
      .filter((id) => id);
    const newSelected =
      selectedGroups.size === allIds.length
        ? new Set<number>()
        : new Set(allIds);

    setSelectedGroups(newSelected);
  }, [policyGroups, selectedGroups.size]);

  const onCheck = useCallback((groupIdx: number) => {
    setSelectedGroups((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(groupIdx)) {
        newSelected.delete(groupIdx);
      } else {
        newSelected.add(groupIdx);
      }
      return newSelected;
    });
  }, []);

  // 유저 선택 관리
  const handleUserSelectAll = () => {
    if (!groupUsers) return;
    const allUserIds = groupUsers
      .map((user) => user.userId)
      .filter(Boolean) as string[];
    const newSelected =
      selectedUsers.size === allUserIds.length
        ? new Set<string>()
        : new Set(allUserIds);
    setSelectedUsers(newSelected);
  };

  const handleUserCheck = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(userId)) {
        newSelected.delete(userId);
      } else {
        newSelected.add(userId);
      }
      return newSelected;
    });
  };

  // UserDirectorySelect 값 변경 핸들러 (다중 유저 지원)
  const onChangeUserDirectorySelect = (e: React.ChangeEvent<any>) => {
    const {value} = e.target;
    setSelectedUsersForAdd({
      userIds: value.userIds || [],
      deptCds: value.deptCds || [],
    });
  };

  // 유저 추가/삭제 함수들 (다중 유저 지원)
  const addUserToGroup = async () => {
    if (!selectedGroupIdx || selectedUsersForAdd.userIds.length === 0) {
      AlertService.error("그룹과 유저를 선택해주세요.");
      return;
    }

    try {
      const res = await requestPost("/attendance/insertGroupUserMapping", {
        groupIdx: selectedGroupIdx,
        userIds: selectedUsersForAdd.userIds,
      });

      if (res.statusCode === 200) {
        AlertService.success(res.message || "유저가 그룹에 추가되었습니다.");
        getGroupUsers(selectedGroupIdx);
        closeModal();
        // 선택 상태 초기화
        setSelectedUsersForAdd({userIds: [], deptCds: []});
      } else if (res.statusCode === 409) {
        AlertService.error(
          res.message || "이미 그룹에 포함된 유저가 있습니다.",
        );
      } else {
        AlertService.error(
          `유저 추가에 실패했습니다: ${res.message || "알 수 없는 오류"}`,
        );
      }
    } catch (error) {
      console.error("addUserToGroup 에러:", error);
      AlertService.error("유저 추가 중 오류가 발생했습니다.");
    }
  };

  const removeUsersFromGroup = async () => {
    if (selectedUsers.size === 0) {
      AlertService.error("선택된 사용자가 없습니다.");
      return;
    }

    const executeDeletion = async () => {
      try {
        const requestData = {
          userIds: Array.from(selectedUsers),
          groupIdx: selectedGroupIdx,
        };

        const res = await requestPost(
          "/attendance/deleteBulkGroupUserMappings",
          requestData,
        );

        if (res.statusCode === 200) {
          AlertService.success(
            `${selectedUsers.size}명의 사용자가 그룹에서 제거되었습니다.`,
          );
          if (selectedGroupIdx) getGroupUsers(selectedGroupIdx);
          setSelectedUsers(new Set());
        } else {
          AlertService.error("사용자 삭제에 실패했습니다.");
          console.error("삭제 실패:", res);
        }
      } catch (error) {
        console.error("삭제 API 호출 오류:", error);
        AlertService.error("연락처 삭제 중 오류가 발생했습니다.");
      }
    };

    AlertService.warn(
      `선택된 ${selectedUsers.size}명의 사용자를 그룹에서 제거하시겠습니까?`,
      {
        useConfirmBtn: true,
        useCancelBtn: true,
        onConfirm: () => executeDeletion(),
        onCancel: () => {
          return;
        },
      },
    );
  };

  // 유저 편집 시작
  const onClickUserEdit = (userId: string) => {
    setEditingUserMode("edit");
    setEditingUserId(userId);
  };

  // 유저 정보 변경
  const onChangeEditingUser = (
    e: React.ChangeEvent<HTMLInputElement>,
    userId: string,
  ) => {
    const {name, value} = e.target;

    setGroupUsers((prev) =>
      prev
        ? prev.map((user) =>
            user.userId === userId
              ? {
                  ...user,
                  employee: {
                    ...user.employee,
                    [name]: value,
                  },
                }
              : user,
          )
        : [],
    );
  };

  // 유저 정보 저장
  const handleSaveUserEdit = async (userId: string) => {
    if (!groupUsers || !selectedGroupIdx) return;

    const user = groupUsers.find((u) => u.userId === userId);
    if (!user || !user.employee) return;

    try {
      const res = await requestPost("/attendance/updateUserInfo", {
        userId,
        employee: user.employee,
      });

      if (res.statusCode === 200) {
        AlertService.success("유저 정보가 수정되었습니다.");
        setEditingUserMode("view");
        setEditingUserId(null);
        getGroupUsers(selectedGroupIdx); // 유저 목록 새로고침
      } else {
        AlertService.error(
          `유저 정보 수정에 실패했습니다: ${res.message || "알 수 없는 오류"}`,
        );
      }
    } catch (error) {
      console.error("handleSaveUserEdit 에러:", error);
      AlertService.error("유저 정보 수정 중 오류가 발생했습니다.");
    }
  };

  // 유저 편집 키보드 핸들러
  const handleUserKeyDown = (e: React.KeyboardEvent, userId: string) => {
    if (e.key === "Enter") {
      handleSaveUserEdit(userId);
    } else if (e.key === "Escape") {
      handleCancelUserEdit();
    }
  };

  // 유저 편집 취소
  const handleCancelUserEdit = () => {
    setEditingUserMode("view");
    setEditingUserId(null);
    // 원래 데이터로 되돌리기 위해 다시 fetch
    if (selectedGroupIdx) {
      getGroupUsers(selectedGroupIdx);
    }
  };

  const onClickBulkDelete = async () => {
    if (selectedGroups.size === 0) {
      AlertService.error("선택된 정책이 없습니다.");
      return;
    }

    const executeDeletion = async () => {
      try {
        const requestData = {
          groupIdxs: Array.from(selectedGroups),
        };

        const res = await requestPost(
          "/attendance/deleteBulkPolicyGroups",
          requestData,
        );

        if (res.statusCode === 200) {
          AlertService.success(
            `${selectedGroups.size}개의 정책 그룹이 삭제되었습니다.`,
          );
          getPolicyGroups();
          setSelectedGroups(new Set());
        } else {
          AlertService.error("정책 삭제에 실패했습니다.");
          console.error("삭제 실패:", res);
        }
      } catch (error) {
        console.error("삭제 API 호출 오류:", error);
        AlertService.error("정책 삭제 중 오류가 발생했습니다.");
      }
    };

    AlertService.warn(
      `선택된 ${selectedGroups.size}개의 정책을 삭제하시겠습니까?`,
      {
        useConfirmBtn: true,
        useCancelBtn: true,
        onConfirm: () => executeDeletion(),
        onCancel: () => {
          return;
        },
      },
    );
  };

  const isAllSelected =
    policyGroups &&
    policyGroups.length > 0 &&
    selectedGroups.size === policyGroups.length;

  const isAllUsersSelected =
    groupUsers &&
    groupUsers.length > 0 &&
    selectedUsers.size === groupUsers.length;

  return (
    <div className={styles.listWrapper}>
      {/* 상단: 그룹 목록 */}
      <div className={styles.mailListContainer}>
        <h3>정책 그룹 관리</h3>
        <div className={styles.mailListHeader}>
          <div className={clsx(styles.row, styles.gap1rem)}>
            <div className={styles.inRowGroup}>
              <ButtonBasic
                componentType="grayBorder"
                width="4rem"
                disabled={selectedGroups.size === 0}
                onClick={onClickBulkDelete}
              >
                삭제
              </ButtonBasic>
            </div>
          </div>
        </div>

        <ListHeader
          onSelectAll={handleSelectAll}
          isAllSelected={isAllSelected || false}
        />
        {policyGroups && policyGroups.length > 0 ? (
          policyGroups.map((pg: EmpPolicyGroupType) => {
            const isSelected = selectedGroupIdx === pg.groupIdx;
            const groupIdx = pg.groupIdx || 0;

            return (
              <GroupRowComponent
                key={pg.groupIdx}
                pg={pg}
                groupIdx={groupIdx}
                isSelected={isSelected}
                mode={mode}
                setMode={setMode}
                editingGroupIdx={editingGroupIdx}
                selectedGroups={selectedGroups}
                onClickEdit={onClickEdit}
                onCheck={onCheck}
                onChangeEditingGroup={onChangeEditingGroup}
                handleKeyDown={handleKeyDown}
                handleSaveEdit={handleSaveEdit}
                handleGroupSelect={handleGroupSelect}
              />
            );
          })
        ) : (
          <div className={styles.noContact}>그룹이 없습니다.</div>
        )}
        <Divider type="none" />
        <IconNode
          onClick={addGroup}
          iconName="circlePlus"
          size={26}
          color="gray4"
        />
      </div>

      <Divider type="middle" />

      {/* 하단: 선택된 그룹의 유저 목록 */}
      <div className={styles.mailListContainer}>
        <h3>
          그룹 유저 관리
          {selectedGroupIdx && (
            <span className={styles.selectedGroupInfo}>
              (선택된 그룹:{" "}
              {
                policyGroups?.find((g) => g.groupIdx === selectedGroupIdx)
                  ?.groupNm
              }
              )
            </span>
          )}
        </h3>

        {selectedGroupIdx ? (
          <>
            <div className={styles.mailListHeader}>
              <div className={clsx(styles.row, styles.gap1rem)}>
                <div className={styles.inRowGroup}>
                  <ButtonBasic
                    componentType="grayBorder"
                    width="4rem"
                    disabled={selectedUsers.size === 0}
                    onClick={removeUsersFromGroup}
                  >
                    제거
                  </ButtonBasic>
                  <ButtonBasic
                    componentType="grayBorder"
                    width="5rem"
                    onClick={openModal}
                  >
                    유저 추가
                  </ButtonBasic>
                </div>
              </div>
            </div>

            <div
              className={clsx(
                styles.lineWrapper,
                styles.headerRow,
                styles.userRow,
              )}
            >
              <div className={styles.check}>
                <CheckBox
                  componentType="orange"
                  value={isAllUsersSelected || false}
                  onChange={handleUserSelectAll}
                />
              </div>
              <div className={styles.userId}>이름</div>
              <div className={styles.deptNm}>부서</div>
              <div className={styles.posNm}>직책</div>
              <div className={styles.editBtn}>편집</div>
            </div>

            {groupUsers && groupUsers.length > 0 ? (
              groupUsers.map((user) => {
                const isEditingThis =
                  editingUserMode === "edit" && editingUserId === user.userId;

                return (
                  <div
                    key={user.userId}
                    className={clsx(styles.lineWrapper, styles.userRow)}
                  >
                    <div className={styles.check}>
                      <CheckBox
                        componentType="orange"
                        value={selectedUsers.has(user.userId || "")}
                        onChange={() => handleUserCheck(user.userId || "")}
                      />
                    </div>

                    <div className={styles.userId}>
                      {isEditingThis ? (
                        <InputBasic
                          name="korNm"
                          value={user.employee?.korNm || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            onChangeEditingUser(e, user.userId || "")
                          }
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>,
                          ) => handleUserKeyDown(e, user.userId || "")}
                          autoFocus
                        />
                      ) : (
                        user.employee?.korNm
                      )}
                    </div>

                    <div className={styles.deptNm}>
                      {isEditingThis ? (
                        <InputBasic
                          name="deptNm"
                          value={user.employee?.deptNm || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            onChangeEditingUser(e, user.userId || "")
                          }
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>,
                          ) => handleUserKeyDown(e, user.userId || "")}
                        />
                      ) : (
                        user.employee?.deptNm
                      )}
                    </div>

                    <div className={styles.posNm}>
                      {isEditingThis ? (
                        <InputBasic
                          name="posNm"
                          value={user.employee?.posNm || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            onChangeEditingUser(e, user.userId || "")
                          }
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>,
                          ) => handleUserKeyDown(e, user.userId || "")}
                        />
                      ) : (
                        user.employee?.posNm
                      )}
                    </div>

                    <div className={styles.editBtn}>
                      {isEditingThis ? (
                        <div className={styles.editActions}>
                          <ButtonBasic
                            componentType="basic"
                            width="2.5rem"
                            onClick={() =>
                              handleSaveUserEdit(user.userId || "")
                            }
                          >
                            저장
                          </ButtonBasic>
                          <ButtonBasic
                            componentType="grayBorder"
                            width="2.5rem"
                            onClick={handleCancelUserEdit}
                          >
                            취소
                          </ButtonBasic>
                        </div>
                      ) : (
                        <ButtonBasic
                          componentType="grayBorder"
                          width="2.5rem"
                          onClick={() => onClickUserEdit(user.userId || "")}
                        >
                          수정
                        </ButtonBasic>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.noContact}>
                이 그룹에 속한 유저가 없습니다.
              </div>
            )}
          </>
        ) : (
          <div className={styles.noContact}>
            그룹을 선택하면 해당 그룹에 속한 유저 목록을 확인할 수 있습니다.
          </div>
        )}
        <Divider type="none" />
        {/* <IconNode
          onClick={addUserToGroup}
          iconName="circlePlus"
          size={26}
          color="gray4"
        /> */}

        <Modal
          modalConfig={modalConfig}
          closeModal={closeModal}
          modalTitle={"그룹에 유저 추가"}
          width={"40vw"}
          height={"50vh"}
          footerContent={
            <CommonButtonGroup
              usedButtons={{btnSubmit: true, btnCancel: true}}
              onSubmit={addUserToGroup}
              onCancel={() => {
                closeModal();
                setSelectedUsersForAdd({userIds: [], deptCds: []});
              }}
              submitBtnLabel="추가"
              cancelBtnLabel="취소"
            />
          }
        >
          <div style={{padding: "1rem"}}>
            <h4>추가할 유저를 선택해주세요</h4>
            <Divider type="middle" />
            <UserDirectorySelect
              label="유저 선택"
              onChange={onChangeUserDirectorySelect}
              multi={true}
              value={selectedUsersForAdd}
              width="100%"
              placeHolder="성명 + Enter"
            />
          </div>
        </Modal>
      </div>
    </div>
  );
}
