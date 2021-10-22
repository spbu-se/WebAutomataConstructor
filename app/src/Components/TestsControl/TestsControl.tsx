import React, {Component} from 'react';
import ControlWrapper from "../ControlWrapper/ControlWrapper";
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { withStyles, Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { render } from 'react-dom';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import {ComputerType, graph, node} from "../../react-graph-vis-types";
import {Computer} from "../../Logic/Computer";
import { DFA } from '../../Logic/DFA';
import { EpsilonNFA } from '../../Logic/EpsilonNFA';
import { NFA } from '../../Logic/NFA';

const useStyles = makeStyles({
    table: {
        //maxWidth: 250,
        width: "100%",
    },
});

interface testsControlProps {
    computerType: null | ComputerType,
    elements: graph,
    changeStateIsCurrent: (ids: number[], isCurrent: boolean) => void,
}

interface testsControlState {
    result?: boolean,
    currentInputIndex: number,
    tests: Test[]
}

const StyledTableCell = withStyles((theme: Theme) =>
    createStyles({
        head: {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
            fontSize: 11,
        },
        body: {
            fontSize: 11,
        },
    }),
)(TableCell)

interface Test {
    id: number
    inputString: string
    shallAccept: boolean
    result?: boolean
}

//type TestsControlState = {
//    tests: Test[]
//}

class TestsControl extends React.Component<testsControlProps, testsControlState> {
    historyEndRef = React.createRef<HTMLDivElement>();
    
    // TODO: Unify it with RunControl
    private getComputer = (computerType: ComputerType, graph: graph, input: string[]): Computer | undefined => {
        const initialNode = graph.nodes.find(node => node.isInitial)

        if (initialNode === undefined) {
            console.warn("There is no initial node. Computer will not be initialized");
            return;
        }

        switch (computerType) {
            case "dfa":
                try {
                    return new DFA(graph, [initialNode], input);
                } catch (e) {
                    return undefined;
                }
            case "nfa":
                return new NFA(graph, [initialNode], input);
            case "nfa-eps":
                return new EpsilonNFA(graph, [initialNode], input);
        }
    }

    constructor(props: testsControlProps) {
        super(props);
        this.state = {
          tests:[
            {id: 0, inputString: "1111", shallAccept: false},
            {id: 1, inputString: "11", shallAccept: true}
        ],
        result: undefined,
        currentInputIndex: -1
      };
        this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    }
    
    handleTextFieldChange = (id: number, event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      event.preventDefault();
      const {tests} = this.state;
      const myRowIndex = tests.findIndex((row) => row.id === id);
      tests[myRowIndex].inputString = event.target.value;
      console.log(event.target.value);
      this.setState({tests});
    }
    
    handleCheckboxChange = (id: number): void => {
       const {tests} = this.state;
       const myRowId = tests.findIndex((row)=>row.id ===id);
       tests[myRowId].shallAccept = !tests[myRowId].shallAccept;
       this.setState({tests});
    }
    
    runTest = (id: number, input: string) => {
        const splittedInput = input.split("");

        const computer = this.props.computerType === null
            ? undefined 
            : this.getComputer(this.props.computerType, this.props.elements, splittedInput)

        if (computer === undefined) {
            console.warn("Failed to initialize computer")
            return false
        }

        const runResult = computer.run();

        let tests = this.state.tests
        tests[id].result = runResult.isAdmit == tests[id].shallAccept
        this.setState({tests: tests})
    }

    private addRow(){
      let newRow = {id: this.state.tests.length, inputString: "1111", shallAccept: false}
      console.log(this.state.tests.length);
      this.setState({tests: this.state.tests.concat(newRow)});
    }

    private onDelete(index: number) {
        this
            .setState({tests: this.state.tests.slice(0, index)
                .concat(this.state.tests.slice(index+1))})
    }

    private addTestsToTable() {
        return this.state.tests.map((test, index) =>
            <TableRow>
                <TableCell component="th" scope="row" >
                    <Input 
                        defaultValue={test.inputString} 
                      
                        value={test.inputString}
                        onChange={(e) => this.handleTextFieldChange(test.id, e)}
                    />
                </TableCell>
                <TableCell align="right">
                    <Checkbox
                        defaultChecked = {test.shallAccept}
                        color="primary"
                        checked={test.shallAccept}
                        onChange={() => this.handleCheckboxChange(test.id)}
                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                    />
                </TableCell>
                <TableCell align="center">{
                //test.result === undefined ? '?' : (test.shallAccept === true && test.result === true)? "Ок":(test.shallAccept === true && test.result === false)? "Не ок": "?"
                test.result === undefined? '?' : test.result === true ? "Ок" : "Не ок"  

                }</TableCell>
                <TableCell align="right"> <IconButton aria-label="playArrow">
                    <PlayArrowIcon onClick={() => this.runTest(test.id, test.inputString)} />
                    </IconButton> 
                </TableCell>
                <TableCell align="right">   
                    <IconButton aria-label="delete" >
                        <DeleteIcon onClick={() => this.onDelete(index)} />
                    </IconButton> 
                </TableCell>
            </TableRow>)
  }
  
  render() {
      return <ControlWrapper title = {"Тесты"}>
              <TableContainer component={Paper}>
                <Table size="small" aria-label="a dense table">
                    <TableHead>
                    <TableRow>
                    <StyledTableCell>Строка</StyledTableCell>
                        <StyledTableCell align="right">Принимается</StyledTableCell>
                        <StyledTableCell align="right">Результат</StyledTableCell>
                        <StyledTableCell align="right">Запуск</StyledTableCell>
                        <StyledTableCell align="right">Удалить</StyledTableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.addTestsToTable()}
                    </TableBody>
                </Table>
                </TableContainer>
                <Button variant="contained" color="primary" onClick={() => this.addRow()}>
                  Добавить тест
                </Button>
            </ControlWrapper>
  }
}

export default TestsControl;
/////<TableCell align="center">{test.result === undefined? '?' : test.result === true ? "Ок" : "Не ок"}</TableCell>