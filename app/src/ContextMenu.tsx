import { MouseEventHandler } from "react"
import { computerAction, controlAction } from "./action"
import { ComputerType } from "./react-graph-vis-types"
import React, { ReactNode } from 'react';

interface ContextMenuProps {
    computerType: null | ComputerType
    byEmptyStack: boolean
    treeContextInfo: () => string
    treeVisible: () => boolean
}

export const ContextMenu = (props: ContextMenuProps) => {
    const NFAContextMenu = (handleContextMenu: any, handleClose: any) => {
        return (
            <div onContextMenu={handleContextMenu}>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.step}
                    >
                        {"Шаг"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.run}
                    >
                        {"Запуск"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.reset}
                    >
                        {"Сброс"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={computerAction.nfaToDfa}
                    >
                        {"НКА->ДКА"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={props.treeVisible}
                    >
                        {props.treeContextInfo()}
                    </button>
                </div>
            </div>
        )
    }

    const DFAContextMenu = (handleContextMenu: any, handleClose: any) => {
        return (
            <div onContextMenu={handleContextMenu}>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.step}
                    >
                        {"Шаг"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.run}
                    >
                        {"Запуск"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.reset}
                    >
                        {"Сброс"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={computerAction.minimizeDfa}
                    >
                        {"Минимизровать"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={props.treeVisible}
                    >
                        {props.treeContextInfo()}
                    </button>
                </div>
            </div>
        )
    }

    const MealyContextMenu = (handleContextMenu: any, handleClose: any) => {
        return (
            <div onContextMenu={handleContextMenu}>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.step}
                    >
                        {"Шаг"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.run}
                    >
                        {"Запуск"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.reset}
                    >
                        {"Сброс"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={computerAction.mealyToMoore}
                    >
                        {"Мур"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={props.treeVisible}
                    >
                        {props.treeContextInfo()}
                    </button>
                </div>
            </div>
        )
    }


    const MooreContextMenu = (handleContextMenu: any, handleClose: any) => {
        return (
            <div onContextMenu={handleContextMenu}>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.step}
                    >
                        {"Шаг"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.run}
                    >
                        {"Запуск"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.reset}
                    >
                        {"Сброс"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={computerAction.mooreToMealy}
                    >
                        {"Мили"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={props.treeVisible}
                    >
                        {props.treeContextInfo()}
                    </button>
                </div>
            </div>
        )
    }


    const PDAContextMenu = (handleContextMenu: any, handleClose: any) => {
        return (
            <div onContextMenu={handleContextMenu}>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.step}
                    >
                        {"Шаг"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.run}
                    >
                        {"Запуск"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.reset}
                    >
                        {"Сброс"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.changerByStack}

                    >
                        {props.byEmptyStack ? "По стеку" : "По состоянию"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={props.treeVisible}
                    >
                        {props.treeContextInfo()}
                    </button>
                </div>
            </div>
        )
    }

    const AnotherContextMenu = (handleContextMenu: any, handleClose: any) => {
        return (
            <div onContextMenu={handleContextMenu}>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.step}
                    >
                        {"Шаг"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.run}
                    >
                        {"Запуск"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={controlAction.reset}
                    >
                        {"Сброс"}
                    </button>
                </div>
                <div onClick={handleClose}>
                    <button
                        className={"button-context-menu"}
                        onClick={props.treeVisible}
                    >
                        {props.treeContextInfo()}
                    </button>
                </div>
            </div>
        )
    }

    switch (props.computerType) {
        case "nfa":
        case "nfa-eps": {
            return NFAContextMenu
        }
        case "dfa": {
            return DFAContextMenu
        }
        case "mealy":
        case "dmealy": {
            return MealyContextMenu
        }
        case "moore":
        case "dmoore": {
            return MooreContextMenu
        }
        case "pda":
        case "dpda": {
            return PDAContextMenu
        }
        default: {
            return AnotherContextMenu
        }
    }
}






