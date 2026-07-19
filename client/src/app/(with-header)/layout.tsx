"use client";
import styles from "./layout.module.scss";

import {MenuProvider} from "@/context/MenuContext";
import {UserProvider} from "@/context/UserContext";
import {PlanProvider} from "@/context/PlanContext";
import {AlertProvider} from "@/context/AlertContext";

import Header from "@/components/common/layout/Header";
import UserDirectoryView from "@/components/common/user-directory/UserDirectoryView";

import AlertPortal from "@/portals/AlertPortal";
import useModal from "@/hooks/useModal";

export default function CommonLayout({children}: {children: React.ReactNode}) {
	const userDirectoryModal = useModal();

	return (
		<>
			<AlertProvider>
				<UserProvider>
					<MenuProvider>
						<PlanProvider>
							<AlertPortal />
							<main className={styles.main}>
								<Header></Header>
								{children}
								<UserDirectoryView
									userDirectoryModal={userDirectoryModal}
								/>
							</main>
						</PlanProvider>
					</MenuProvider>
				</UserProvider>
			</AlertProvider>
		</>
	);
}
